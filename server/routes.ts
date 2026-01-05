import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./auth";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import { OpenAI } from "openai";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

const upload = multer({ dest: '/tmp/uploads/' });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  // Helper to get user ID from session claims
  const getUserId = (req: any): string => req.user.claims.sub;

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
        You are a resume parser. Extract the following information from the resume text below and return it in JSON format.
        
        Fields to extract:
        - name (string)
        - email (string)
        - phone (string)
        - linkedin (string)
        - portfolio (string)
        - experience (array of objects with: company, title, startDate, endDate, description)
        - education (array of objects with: school, degree, major, gradYear)
        
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

      // Map parsed data to our schema structure
      const updateData = {
        user: {
            firstName: parsedData.name?.split(' ')[0] || parsedData.firstName,
            lastName: parsedData.name?.split(' ').slice(1).join(' ') || parsedData.lastName,
            email: parsedData.email,
            phone: parsedData.phone,
            linkedin: parsedData.linkedin,
            portfolio: parsedData.portfolio
        },
        experience: parsedData.experience || [],
        education: parsedData.education || []
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
    const { name } = req.body;
    const profile = await storage.renameProfile(profileId, name);
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
      res.json({ publishableKey: key });
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
          amount: 3500 // $35
        },
        pro: {
          name: 'SudoFillr Pro',
          description: 'Unlimited everything + 5 resume profiles for 1 year',
          amount: 4500 // $45
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

  return httpServer;
}
