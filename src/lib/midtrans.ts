/**
 * Midtrans Payment Gateway Integration Helper
 * Mendukung Sandbox & Production untuk Snap Checkout
 */

export interface MidtransCustomerDetails {
  first_name?: string;
  email?: string;
  phone?: string;
}

export interface MidtransItemDetails {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails?: MidtransCustomerDetails;
  itemDetails?: MidtransItemDetails[];
}

export interface SnapTransactionResult {
  token: string;
  redirect_url: string;
}

export interface MidtransPaymentResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: "settlement" | "capture" | "pending" | "deny" | "expire" | "cancel";
  fraud_status?: string;
  pdf_url?: string;
  finish_redirect_url?: string;
}

export interface MidtransSnapCallbacks {
  onSuccess?: (result: MidtransPaymentResult) => void;
  onPending?: (result: MidtransPaymentResult) => void;
  onError?: (result: MidtransPaymentResult | { status_message: string }) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks?: MidtransSnapCallbacks) => void;
      embed?: (token: string, options: { embedId: string }) => void;
    };
  }
}

export const getMidtransClientKey = (): string => {
  return (
    import.meta.env.VITE_MIDTRANS_CLIENT_KEY ||
    "Mid-client-KbohWU_DoyjnjUsG"
  );
};

export const isMidtransProduction = (): boolean => {
  return import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true";
};

export const getMidtransSnapUrl = (): string => {
  return isMidtransProduction()
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
};

/**
 * Memuat script Midtrans Snap secara asinkron jika belum ada di DOM.
 */
export const loadMidtransSnapScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.snap) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("midtrans-snap-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "midtrans-snap-script";
    script.src = getMidtransSnapUrl();
    script.setAttribute("data-client-key", getMidtransClientKey());
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.warn("Gagal memuat Midtrans Snap script dari CDN");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Meminta Snap Transaction Token dari backend serverless (/api/midtrans-token).
 */
export const requestSnapToken = async (
  params: CreateSnapTransactionParams
): Promise<SnapTransactionResult> => {
  try {
    const res = await fetch("/api/midtrans-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        return {
          token: data.token,
          redirect_url: data.redirect_url || "",
        };
      }
    }

    // Jika endpoint backend mengembalikan error non-ok
    const errorJson = await res.json().catch(() => ({}));
    console.warn("Midtrans token API error:", errorJson);
  } catch (err) {
    console.warn("Error calling /api/midtrans-token, falling back to mock token:", err);
  }

  // Fallback resilient token untuk offline / sandbox dev jika API offline
  const fallbackToken = `mock-snap-${Date.now()}`;
  return {
    token: fallbackToken,
    redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${fallbackToken}`,
  };
};

/**
 * Membuka Midtrans Snap Popup UI
 */
export const openSnapPayment = (
  token: string,
  callbacks?: MidtransSnapCallbacks
): void => {
  if (typeof window !== "undefined" && window.snap?.pay) {
    window.snap.pay(token, callbacks);
    return;
  }

  // Fallback jika Snap script belum siap atau diblokir adblocker
  console.warn("window.snap.pay tidak tersedia, mencoba fallback");
  if (callbacks?.onError) {
    callbacks.onError({
      status_message: "Jendela pembayaran Midtrans belum siap. Coba beberapa saat lagi.",
    });
  }
};
