import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    const stripe = await getUncachableStripeClient();
    
    const webhookSecret = await sync.getWebhookSecret();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    
    console.log(`Processing Stripe event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.customer && session.subscription) {
          const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (user) {
            await storage.updateStripeInfo(user.id, {
              stripeSubscriptionId: subscriptionId
            });
            await storage.resetUsage(user.id);
            console.log(`Activated subscription ${subscriptionId} for user ${user.id}`);
          }
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        
        const user = await storage.getUserByStripeCustomerId(customerId);
        if (user) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          await storage.updateStripeInfo(user.id, {
            stripeSubscriptionId: isActive ? subscription.id : null
          });
          console.log(`Subscription ${subscription.id} status: ${subscription.status} for user ${user.id}`);
        }
        break;
      }
    }
    
    await sync.processWebhook(payload, signature);
  }
}
