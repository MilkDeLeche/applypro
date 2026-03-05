import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, requireAuth, getUserId } from "./auth";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import { OpenAI } from "openai";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { 
  createLemonSqueezyCheckout, 
  isLemonSqueezyConfigured,
  verifyLemonSqueezyWebhook
} from "./lemonSqueezyClient";

const upload = multer({ dest: '/tmp/uploads/' });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.profile.get.path, requireAuth, async (req, res) => {
    const userId = getUserId(req);
    const profile = await storage.getUserProfile(userId);
    res.json(profile);
  });

  app.put(api.profile.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.profile.update.input.parse(req.body);
      const userId = getUserId(req);
      const updated = await storage.updateUser(userId, input);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.post(api.upload.resume.path, requireAuth, upload.single('resume'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = getUserId(req);

    const usageCheck = await storage.canParseResume(userId);
    if (!usageCheck.allowed) {
      return res.status(403).json({ 
        message: "Free tier limit reached. Upgrade to Pro for unlimited resume parsing.",
        remaining: usageCheck.remaining,
        isPremium: usageCheck.isPremium
      });
    }

    try {
      if (!fs.existsSync('/tmp/uploads')) {
        fs.mkdirSync('/tmp/uploads', { recursive: true });
      }
      
      const dataBuffer = fs.readFileSync(req.file.path);
      const parser = new PDFParse({ data: dataBuffer });
      const pdfData = await parser.getText();
      const text = pdfData.text;
      await parser.destroy();

      // Clean up file
      fs.unlinkSync(req.file.path);

      // Check for AI Integration credentials
      if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY || !process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
        console.error("Missing AI Integration credentials:", {
          hasApiKey: !!process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
          hasBaseUrl: !!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
        });
        return res.status(500).json({ message: "AI service not configured" });
      }

      // AI Parsing - use Replit AI Integration
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });
      
      const prompt = `
        You are an expert resume parser specializing in international formats, especially Latin American (LATAM) resumes/CVs.
        
        STEP 1: Detect the resume format/country:
        - Look for indicators like RFC, CURP (Mexico), RUT (Chile), or Spanish language usage
        - Check for LATAM name patterns (double last names: apellido paterno + apellido materno)
        - Look for LATAM address formats: colonia, delegacion (Mexico) or comuna, region (Chile)
        - Detect phone formats: +52 (Mexico), +56 (Chile), +1 (US/Canada)
        
        STEP 2: Extract all fields in JSON format:
        
        {
          "detectedCountry": "mx" | "cl" | "us" | "other",
          "firstName": "string (nombre)",
          "lastName": "string (for US/other - single last name)",
          "paternalLastName": "string (apellido paterno - for LATAM)",
          "maternalLastName": "string (apellido materno - for LATAM)",
          "email": "string",
          "phone": "string (local format without country code)",
          "phoneCountryCode": "string (+52, +56, +1, etc)",
          "linkedin": "string (full URL)",
          "portfolio": "string (full URL)",
          "rfc": "string (Mexican tax ID - 13 chars)",
          "curp": "string (Mexican ID - 18 chars)",
          "rut": "string (Chilean tax ID - format XX.XXX.XXX-X)",
          "address": "string (street address / calle y numero)",
          "colonia": "string (Mexican neighborhood)",
          "delegacion": "string (Mexican municipality)",
          "comuna": "string (Chilean commune)",
          "region": "string (Chilean region)",
          "city": "string (ciudad)",
          "state": "string (estado/region)",
          "zip": "string (codigo postal)",
          "experience": [
            {
              "company": "string",
              "title": "string (original language)",
              "titleEnglish": "string (translated to English if original is Spanish)",
              "startDate": "string (format: Mon YYYY)",
              "endDate": "string (format: Mon YYYY or 'Present')",
              "description": "string (original language)",
              "descriptionEnglish": "string (translated to English if original is Spanish)",
              "location": "string (city, country)"
            }
          ],
          "education": [
            {
              "school": "string",
              "degree": "string (original language)",
              "degreeEnglish": "string (translated to English if original is Spanish)",
              "major": "string (original language)",
              "majorEnglish": "string (translated to English if original is Spanish)",
              "gradYear": "string (YYYY)",
              "location": "string (city, country)"
            }
          ]
        }
        
        IMPORTANT RULES:
        - For LATAM resumes, ALWAYS split the last name into paternalLastName and maternalLastName
        - For US resumes, use lastName field and leave paternal/maternal empty
        - Always translate Spanish job titles and descriptions to professional English
        - Normalize dates to "Mon YYYY" format (e.g., "Jan 2022")
        - If RFC/CURP/RUT not found, leave those fields empty
        - Extract all experience and education entries found
        
        Resume Text:
        ${text.substring(0, 10000)}
      `;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-5",
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const parsedData = JSON.parse(completion.choices[0].message.content || "{}");

      // Get or create the user's active profile
      const user = await storage.getUser(userId);
      let profileId = user?.activeProfileId;
      
      if (!profileId) {
        const userProfiles = await storage.getProfiles(userId);
        if (userProfiles.length > 0) {
          profileId = userProfiles[0].id;
          await storage.setActiveProfile(userId, profileId);
        } else {
          const newProfile = await storage.createProfile(userId, 'Default Resume');
          profileId = newProfile.id;
          await storage.setActiveProfile(userId, profileId);
        }
      }

      // Map parsed data to our schema structure with LATAM support
      const isLatam = parsedData.detectedCountry === 'mx' || parsedData.detectedCountry === 'cl';
      
      const updateData = {
        user: {
            firstName: parsedData.firstName || parsedData.name?.split(' ')[0],
            lastName: isLatam ? null : (parsedData.lastName || parsedData.name?.split(' ').slice(1).join(' ')),
            paternalLastName: parsedData.paternalLastName || null,
            maternalLastName: parsedData.maternalLastName || null,
            email: parsedData.email,
            phone: parsedData.phone,
            phoneCountryCode: parsedData.phoneCountryCode || null,
            linkedin: parsedData.linkedin,
            portfolio: parsedData.portfolio,
            country: parsedData.detectedCountry || 'us',
            address: parsedData.address || null,
            city: parsedData.city || null,
            state: parsedData.state || null,
            zip: parsedData.zip || null,
            colonia: parsedData.colonia || null,
            delegacion: parsedData.delegacion || null,
            comuna: parsedData.comuna || null,
            region: parsedData.region || null,
            rfc: parsedData.rfc || null,
            curp: parsedData.curp || null,
            rut: parsedData.rut || null
        },
        experience: (parsedData.experience || []).map((exp: any) => ({
          company: exp.company,
          title: exp.title,
          titleEnglish: exp.titleEnglish || null,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
          descriptionEnglish: exp.descriptionEnglish || null,
          location: exp.location || null
        })),
        education: (parsedData.education || []).map((edu: any) => ({
          school: edu.school,
          degree: edu.degree,
          degreeEnglish: edu.degreeEnglish || null,
          major: edu.major,
          majorEnglish: edu.majorEnglish || null,
          gradYear: edu.gradYear,
          location: edu.location || null
        }))
      };

      const resumeProfile = await storage.updateProfileWithParsedData(userId, profileId, updateData);
      
      await storage.incrementResumeParses(userId);
      
      res.json({ message: "Resume parsed successfully", profile: resumeProfile });

    } catch (error: any) {
      console.error("Resume parsing error:", error);
      res.status(500).json({ message: "Failed to parse resume: " + error.message });
    }
  });

  app.post(api.experience.create.path, requireAuth, async (req, res) => {
    const input = api.experience.create.input.parse(req.body);
    const userId = getUserId(req);
    const user = await storage.getUser(userId);
    if (!user?.activeProfileId) {
      return res.status(400).json({ message: "No active profile" });
    }
    const exp = await storage.createExperience(user.activeProfileId, input);
    res.status(201).json(exp);
  });

  app.delete(api.experience.delete.path, requireAuth, async (req, res) => {
    await storage.deleteExperience(Number(req.params.id));
    res.status(204).send();
  });
  
  app.post(api.education.create.path, requireAuth, async (req, res) => {
    const input = api.education.create.input.parse(req.body);
    const userId = getUserId(req);
    const user = await storage.getUser(userId);
    if (!user?.activeProfileId) {
      return res.status(400).json({ message: "No active profile" });
    }
    const edu = await storage.createEducation(user.activeProfileId, input);
    res.status(201).json(edu);
  });

  app.delete(api.education.delete.path, requireAuth, async (req, res) => {
    await storage.deleteEducation(Number(req.params.id));
    res.status(204).send();
  });

  app.get('/api/usage', requireAuth, async (req, res) => {
    const userId = getUserId(req);
    const user = await storage.getUser(userId);
    const resumeUsage = await storage.canParseResume(userId);
    const autofillUsage = await storage.canAutofill(userId);
    const profileCheck = await storage.canCreateProfile(userId);
    
    res.json({
      tier: user?.subscriptionTier || 'free',
      isPremium: !!user?.stripeSubscriptionId,
      resumeParses: {
        used: user?.resumeParsesThisPeriod || 0,
        remaining: resumeUsage.remaining,
        limit: resumeUsage.isPremium ? -1 : 3
      },
      autofills: {
        used: user?.autofillsThisPeriod || 0,
        remaining: autofillUsage.remaining,
        limit: autofillUsage.isPremium ? -1 : 10
      },
      profiles: {
        current: profileCheck.currentCount,
        max: profileCheck.maxProfiles
      }
    });
  });

  app.get('/api/autofill-data', requireAuth, async (req, res) => {
    const userId = getUserId(req);
    const usageCheck = await storage.canAutofill(userId);
    
    if (!usageCheck.allowed) {
      return res.status(403).json({ 
        message: "Free tier limit reached. Upgrade to Standard or Pro for unlimited autofills.",
        remaining: usageCheck.remaining
      });
    }
    
    const profileId = req.query.profileId ? Number(req.query.profileId) : null;
    const user = await storage.getUser(userId);
    const targetProfileId = profileId || user?.activeProfileId;
    
    if (!targetProfileId) {
      return res.status(400).json({ message: "No profile selected" });
    }
    
    const resumeProfile = await storage.getResumeProfile(targetProfileId);
    await storage.incrementAutofills(userId);
    
    res.json({ user, ...resumeProfile });
  });

  // Profile management routes
  app.get('/api/profiles', requireAuth, async (req, res) => {
    const userId = getUserId(req);
    const profiles = await storage.getProfiles(userId);
    const user = await storage.getUser(userId);
    res.json({ profiles, activeProfileId: user?.activeProfileId });
  });

  app.post('/api/profiles', requireAuth, async (req, res) => {
    const userId = getUserId(req);
    const { name } = req.body;
    
    const canCreate = await storage.canCreateProfile(userId);
    if (!canCreate.allowed) {
      return res.status(403).json({ 
        message: `You can only have ${canCreate.maxProfiles} profile(s) on your current plan. Upgrade to Pro for up to 5 profiles.`,
        currentCount: canCreate.currentCount,
        maxProfiles: canCreate.maxProfiles
      });
    }
    
    const profile = await storage.createProfile(userId, name || 'New Resume');
    res.status(201).json(profile);
  });

  app.put('/api/profiles/:id', requireAuth, async (req, res) => {
    const profileId = Number(req.params.id);
    const { name, coverLetter } = req.body;
    const updates: { name?: string; coverLetter?: string | null } = {};
    if (name !== undefined) updates.name = name;
    if (coverLetter !== undefined) updates.coverLetter = coverLetter;
    const profile = await storage.updateProfile(profileId, updates);
    res.json(profile);
  });

  app.delete('/api/profiles/:id', requireAuth, async (req, res) => {
    const userId = getUserId(req);
    const profileId = Number(req.params.id);
    
    const profiles = await storage.getProfiles(userId);
    if (profiles.length <= 1) {
      return res.status(400).json({ message: "Cannot delete your only profile" });
    }
    
    await storage.deleteProfile(profileId);
    
    const user = await storage.getUser(userId);
    if (user?.activeProfileId === profileId) {
      const remaining = profiles.filter(p => p.id !== profileId);
      if (remaining.length > 0) {
        await storage.setActiveProfile(userId, remaining[0].id);
      }
    }
    
    res.status(204).send();
  });

  app.post('/api/profiles/:id/activate', requireAuth, async (req, res) => {
    const userId = getUserId(req);
    const profileId = Number(req.params.id);
    await storage.setActiveProfile(userId, profileId);
    res.json({ message: "Profile activated" });
  });

  app.get('/api/stripe/publishable-key', async (req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key ?? null });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get Stripe key' });
    }
  });

  app.post('/api/checkout', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { tier } = req.body; // 'standard' or 'pro'
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const stripe = await getUncachableStripeClient();
      if (!stripe) {
        return res.status(503).json({ error: 'Payments not configured. Set STRIPE_SECRET_KEY.' });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId }
        });
        await storage.updateStripeInfo(userId, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const plans = {
        standard: {
          name: 'SudoFillr Standard',
          description: 'Unlimited resume parsing and autofills for 1 year',
          amount: 7000 // $70/year
        },
        pro: {
          name: 'SudoFillr Pro',
          description: 'Unlimited everything + 5 resume profiles for 1 year',
          amount: 8000 // $80/year
        }
      };

      const selectedPlan = plans[tier as keyof typeof plans] || plans.standard;

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
              metadata: { tier: tier || 'standard' }
            },
            unit_amount: selectedPlan.amount,
            recurring: { interval: 'year' }
          },
          quantity: 1
        }],
        mode: 'subscription',
        metadata: { tier: tier || 'standard', userId },
        success_url: `${req.protocol}://${req.get('host')}/dashboard?success=true`,
        cancel_url: `${req.protocol}://${req.get('host')}/pricing?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  app.get('/api/subscription', requireAuth, async (req, res) => {
    const userId = getUserId(req);
    const user = await storage.getUser(userId);
    
    if (!user?.stripeSubscriptionId) {
      return res.json({ subscription: null });
    }

    const subscription = await storage.getSubscription(user.stripeSubscriptionId);
    res.json({ subscription });
  });

  // Clear profile data (experience, education, and user profile fields)
  app.post('/api/profile/clear', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.clearProfileData(userId);
      res.json({ message: 'Profile data cleared successfully' });
    } catch (error: any) {
      console.error('Clear profile error:', error);
      res.status(500).json({ message: 'Failed to clear profile data' });
    }
  });

  // Delete account entirely
  app.delete('/api/account', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteAccount(userId);
      
      // Destroy session
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });
      
      res.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: 'Failed to delete account' });
    }
  });

  app.post('/api/billing-portal', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: 'No billing account found' });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.protocol}://${req.get('host')}/dashboard`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Billing portal error:', error);
      res.status(500).json({ error: 'Failed to create billing portal session' });
    }
  });

  // Lemon Squeezy checkout for all users (alternative to Stripe)
  app.post('/api/lemonsqueezy/checkout', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { tier } = req.body;
      
      if (!isLemonSqueezyConfigured()) {
        return res.status(503).json({ error: 'Lemon Squeezy not configured' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const successUrl = `${req.protocol}://${req.get('host')}/dashboard?success=true`;
      
      const checkout = await createLemonSqueezyCheckout({
        tier: tier || 'standard',
        userEmail: user.email || '',
        userId: userId,
        successUrl
      });
      
      res.json({ 
        url: checkout.url,
        checkoutId: checkout.checkoutId 
      });
    } catch (error: any) {
      console.error('Lemon Squeezy checkout error:', error);
      res.status(500).json({ error: 'Failed to create Lemon Squeezy checkout' });
    }
  });

  // Lemon Squeezy webhook handler with signature verification
  app.post('/api/lemonsqueezy/webhook', async (req, res) => {
    try {
      const signature = req.headers['x-signature'] as string;
      const rawBody = (req as any).rawBody as Buffer;
      
      if (!rawBody || !signature || !verifyLemonSqueezyWebhook(rawBody, signature)) {
        console.warn('Lemon Squeezy webhook signature verification failed');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      const payload = req.body;
      const eventName = payload.meta?.event_name;
      
      console.log('Lemon Squeezy webhook received:', eventName);
      
      if (eventName === 'subscription_created' || eventName === 'order_created') {
        const customData = payload.meta?.custom_data;
        const userId = customData?.user_id;
        const tier = customData?.tier as 'standard' | 'pro';
        
        if (userId && tier) {
          const subscriptionId = payload.data?.id;
          await storage.updateUser(userId, {
            subscriptionTier: tier,
            paymentProvider: 'lemonsqueezy',
            lemonSqueezySubscriptionId: subscriptionId,
          });
          console.log(`User ${userId} upgraded to ${tier} via Lemon Squeezy`);
        }
      }
      
      if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
        const customData = payload.meta?.custom_data;
        const userId = customData?.user_id;
        
        if (userId) {
          await storage.updateUser(userId, {
            subscriptionTier: 'free',
            paymentProvider: null,
            lemonSqueezySubscriptionId: null,
          });
          console.log(`User ${userId} subscription cancelled via Lemon Squeezy`);
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Lemon Squeezy webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Get available payment providers based on country
  app.get('/api/payment-providers', async (req, res) => {
    const country = (req.query.country as string) || 'us';
    
    const providers = {
      stripe: true,
      lemonsqueezy: isLemonSqueezyConfigured()
    };
    
    const pricing: Record<string, { standard: number; pro: number; currency: string }> = {
      us: { standard: 70, pro: 80, currency: 'USD' },
      mx: { standard: 1300, pro: 1500, currency: 'MXN' },
      cl: { standard: 65000, pro: 75000, currency: 'CLP' },
      other: { standard: 70, pro: 80, currency: 'USD' }
    };
    
    res.json({
      providers,
      pricing: pricing[country] || pricing.us
    });
  });

  return httpServer;
}
