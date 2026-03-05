import { lemonSqueezySetup, createCheckout, cancelSubscription, getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import crypto from "crypto";

const API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

export function isLemonSqueezyConfigured(): boolean {
  return !!(API_KEY && STORE_ID);
}

export function initializeLemonSqueezy() {
  if (!API_KEY) {
    console.warn("Lemon Squeezy API key not configured");
    return false;
  }
  
  lemonSqueezySetup({
    apiKey: API_KEY,
    onError: (error) => console.error("Lemon Squeezy Error:", error),
  });
  
  return true;
}

export interface CreateCheckoutParams {
  tier: "standard" | "pro";
  userEmail: string;
  userId: string;
  successUrl: string;
}

export async function createLemonSqueezyCheckout(params: CreateCheckoutParams) {
  const { tier, userEmail, userId, successUrl } = params;
  
  if (!API_KEY || !STORE_ID) {
    throw new Error("Lemon Squeezy not configured");
  }
  
  initializeLemonSqueezy();
  
  const variantId = tier === "standard" 
    ? process.env.LEMONSQUEEZY_STANDARD_VARIANT_ID 
    : process.env.LEMONSQUEEZY_PRO_VARIANT_ID;
  
  if (!variantId) {
    throw new Error(`Lemon Squeezy variant ID not configured for tier: ${tier}`);
  }
  
  const checkout = await createCheckout(STORE_ID, variantId, {
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
      desc: true,
      discount: true,
    },
    checkoutData: {
      email: userEmail,
      custom: {
        user_id: userId,
        tier: tier,
      },
    },
    productOptions: {
      redirectUrl: successUrl,
      receiptButtonText: "Go to Dashboard",
      receiptThankYouNote: "Thank you for subscribing to PostulaPro!",
    },
  });
  
  return {
    url: checkout.data?.data.attributes.url,
    checkoutId: checkout.data?.data.id,
  };
}

export async function cancelLemonSqueezySubscription(subscriptionId: string) {
  if (!API_KEY) {
    throw new Error("Lemon Squeezy not configured");
  }
  
  initializeLemonSqueezy();
  
  const result = await cancelSubscription(subscriptionId);
  return result;
}

export async function getLemonSqueezySubscription(subscriptionId: string) {
  if (!API_KEY) {
    throw new Error("Lemon Squeezy not configured");
  }
  
  initializeLemonSqueezy();
  
  const subscription = await getSubscription(subscriptionId);
  return subscription.data?.data;
}

export function verifyLemonSqueezyWebhook(rawBody: Buffer | string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("Lemon Squeezy webhook secret not configured - skipping verification");
    return false;
  }
  
  if (!signature) {
    return false;
  }
  
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest("hex");
  
  const signatureBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);
  
  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}

export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
      tier?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      cancelled: boolean;
      ends_at: string | null;
      renews_at: string | null;
      user_email: string;
      variant_id: number;
      product_id: number;
      subscription_id?: number;
    };
  };
}

export function parseLemonSqueezyWebhook(payload: LemonSqueezyWebhookPayload) {
  const { meta, data } = payload;
  
  return {
    eventName: meta.event_name,
    userId: meta.custom_data?.user_id,
    tier: meta.custom_data?.tier as "standard" | "pro" | undefined,
    subscriptionId: data.id,
    status: data.attributes.status,
    cancelled: data.attributes.cancelled,
    endsAt: data.attributes.ends_at,
    renewsAt: data.attributes.renews_at,
    userEmail: data.attributes.user_email,
  };
}
