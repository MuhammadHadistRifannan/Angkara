import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { IncomingMessage, ServerResponse } from "node:http";

interface SnapRequestBody {
  orderId?: string;
  grossAmount?: number;
  customerDetails?: Record<string, unknown>;
  itemDetails?: Array<Record<string, unknown>>;
}

function midtransDevPlugin(): Plugin {
  return {
    name: "midtrans-dev-server",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/midtrans-token", async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let bodyStr = "";
        req.on("data", (chunk: Buffer | string) => {
          bodyStr += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const body: SnapRequestBody = JSON.parse(bodyStr || "{}");
            const serverKey = process.env.MIDTRANS_SERVER_KEY;
            if (!serverKey) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "MIDTRANS_SERVER_KEY is not configured" }));
              return;
            }
            const isProduction =
              process.env.VITE_MIDTRANS_IS_PRODUCTION === "true";
            const endpoint = isProduction
              ? "https://app.midtrans.com/snap/v1/transactions"
              : "https://app.sandbox.midtrans.com/snap/v1/transactions";

            const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
            const midtransRes = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: authHeader,
              },
              body: JSON.stringify({
                transaction_details: {
                  order_id: String(body.orderId || ""),
                  gross_amount: Math.round(Number(body.grossAmount || 0)),
                },
                customer_details: body.customerDetails,
                item_details: body.itemDetails,
                usage_limit: 1,
              }),
            });

            const data = await midtransRes.json();
            res.statusCode = midtransRes.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            const message =
              err instanceof Error ? err.message : "Failed to create token";
            res.end(JSON.stringify({ error: message }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  assetsInclude: ["**/*.glb"],
  plugins: [
    react(),
    midtransDevPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
