export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    res.status(500).json({ error: "MIDTRANS_SERVER_KEY is not configured" });
    return;
  }
  const isProduction = process.env.VITE_MIDTRANS_IS_PRODUCTION === "true";
  const endpoint = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const { orderId, grossAmount, customerDetails, itemDetails } = body;

  if (!orderId || !grossAmount) {
    res.status(400).json({ error: "orderId and grossAmount are required" });
    return;
  }

  try {
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
          order_id: String(orderId),
          gross_amount: Math.round(Number(grossAmount)),
        },
        customer_details: customerDetails,
        item_details: itemDetails,
        usage_limit: 1,
      }),
    });

    const data = await midtransRes.json();
    if (!midtransRes.ok) {
      res.status(midtransRes.status).json(data);
      return;
    }

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create Midtrans token" });
  }
}
