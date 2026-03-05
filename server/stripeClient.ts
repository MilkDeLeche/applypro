import Stripe from 'stripe';

let connectionSettings: any;

async function getCredentials(): Promise<{ publishableKey: string; secretKey: string } | null> {
  // Standard env vars (Supabase / Railway / local)
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (secretKey && publishableKey) {
    return { secretKey, publishableKey };
  }

  // Replit connector (legacy)
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    return null;
  }

  const connectorName = 'stripe';
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', connectorName);
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  connectionSettings = data.items?.[0];

  if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
    return null;
  }

  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret,
  };
}

export async function getUncachableStripeClient(): Promise<Stripe | null> {
  const creds = await getCredentials();
  if (!creds) return null;

  return new Stripe(creds.secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function getStripePublishableKey(): Promise<string | null> {
  const creds = await getCredentials();
  return creds?.publishableKey ?? null;
}

export async function getStripeSecretKey(): Promise<string | null> {
  const creds = await getCredentials();
  return creds?.secretKey ?? null;
}

let stripeSync: any = null;

export async function getStripeSync(): Promise<any | null> {
  const secretKey = await getStripeSecretKey();
  if (!secretKey) return null;

  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
}
