import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment } from "mercadopago";

// Mercado Pago pricing configuration
export const MERCADOPAGO_PRICING = {
  mx: {
    standard: { amount: 650, currency: "MXN" },
    pro: { amount: 850, currency: "MXN" }
  },
  cl: {
    standard: { amount: 30000, currency: "CLP" },
    pro: { amount: 40000, currency: "CLP" }
  }
} as const;

export type MercadoPagoCountry = keyof typeof MERCADOPAGO_PRICING;

let mercadoPagoClientMX: MercadoPagoConfig | null = null;
let mercadoPagoClientCL: MercadoPagoConfig | null = null;

export function getMercadoPagoClient(country: MercadoPagoCountry): MercadoPagoConfig {
  if (country === "mx") {
    if (!mercadoPagoClientMX) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN_MX;
      if (!accessToken) {
        throw new Error("MERCADOPAGO_ACCESS_TOKEN_MX not configured");
      }
      mercadoPagoClientMX = new MercadoPagoConfig({ accessToken });
    }
    return mercadoPagoClientMX;
  } else {
    if (!mercadoPagoClientCL) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN_CL;
      if (!accessToken) {
        throw new Error("MERCADOPAGO_ACCESS_TOKEN_CL not configured");
      }
      mercadoPagoClientCL = new MercadoPagoConfig({ accessToken });
    }
    return mercadoPagoClientCL;
  }
}

export function isMercadoPagoConfigured(country: MercadoPagoCountry): boolean {
  if (country === "mx") {
    return !!process.env.MERCADOPAGO_ACCESS_TOKEN_MX;
  }
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN_CL;
}

export interface CreateSubscriptionParams {
  country: MercadoPagoCountry;
  tier: "standard" | "pro";
  payerEmail: string;
  externalReference: string;
  backUrl: string;
}

export async function createMercadoPagoSubscription(params: CreateSubscriptionParams) {
  const { country, tier, payerEmail, externalReference, backUrl } = params;
  const client = getMercadoPagoClient(country);
  const pricing = MERCADOPAGO_PRICING[country][tier];
  
  const preApproval = new PreApproval(client);
  
  const tierLabel = tier === "standard" ? "Estándar" : "Pro";
  const reason = `SudoFillr ${tierLabel} - Suscripción Anual`;
  
  const response = await preApproval.create({
    body: {
      reason,
      payer_email: payerEmail,
      auto_recurring: {
        frequency: 12,
        frequency_type: "months",
        transaction_amount: pricing.amount,
        currency_id: pricing.currency,
      },
      back_url: backUrl,
      external_reference: externalReference,
      status: "pending"
    }
  });
  
  return response;
}

export async function cancelMercadoPagoSubscription(subscriptionId: string, country: MercadoPagoCountry) {
  const client = getMercadoPagoClient(country);
  const preApproval = new PreApproval(client);
  
  return await preApproval.update({
    id: subscriptionId,
    body: {
      status: "cancelled"
    }
  });
}

export function verifyMercadoPagoWebhook(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string
): boolean {
  const crypto = require("crypto");
  
  // Build the manifest string as per MercadoPago docs
  const manifest = `id:${dataId};request-id:${xRequestId};`;
  
  // Extract ts and hash from x-signature header
  const parts = xSignature.split(",");
  let ts = "";
  let hash = "";
  
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key.trim() === "ts") ts = value.trim();
    if (key.trim() === "v1") hash = value.trim();
  }
  
  if (!ts || !hash) return false;
  
  // Build the signed template
  const signedTemplate = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  
  // Calculate HMAC
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(signedTemplate);
  const calculatedHash = hmac.digest("hex");
  
  return calculatedHash === hash;
}
