import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./auth";
import multer from "multer";
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
import fs from "fs";
import { OpenAI } from "openai";

// Setup OpenAI (Replit integration handles the key if using the blueprint)
// But for "blueprint:javascript_openai_ai_integrations", it uses REPLIT_AI_...
// We can use the standard OpenAI SDK but we need to check how Replit injects it.
// Actually, with the blueprint, it might just set OPENAI_API_KEY if we use the standard one?
// No, the blueprint says "internally uses Replit AI Integrations... provides OpenAI-compatible API access".
// Usually this means we don't need to do much if we use the right endpoint/config, 
// OR it sets the env vars.
// The safe bet is to assume standard OpenAI SDK works if the blueprint sets the env vars.
// If not, we might need to configure the base URL.
// Replit AI usually sets OPENAI_API_KEY to a special token and base URL.

const upload = multer({ dest: 'uploads/' });

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
    const profile = await storage.getProfile(userId);
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

    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      const text = pdfData.text;

      // Clean up file
      fs.unlinkSync(req.file.path);

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
        ${text.substring(0, 10000)} // Truncate to avoid token limits if massive
      `;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o",
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const parsedData = JSON.parse(completion.choices[0].message.content || "{}");
      
      const userId = getUserId(req);

      // Map parsed data to our schema structure
      const updateData = {
        user: {
            name: parsedData.name,
            email: parsedData.email,
            phone: parsedData.phone,
            linkedin: parsedData.linkedin,
            portfolio: parsedData.portfolio
        },
        experience: parsedData.experience || [],
        education: parsedData.education || []
      };

      const profile = await storage.updateProfileWithParsedData(userId, updateData);
      
      res.json({ message: "Resume parsed successfully", profile });

    } catch (error: any) {
      console.error("Resume parsing error:", error);
      res.status(500).json({ message: "Failed to parse resume: " + error.message });
    }
  });

  app.post(api.experience.create.path, requireAuth, async (req, res) => {
    const input = api.experience.create.input.parse(req.body);
    const userId = getUserId(req);
    const exp = await storage.createExperience(userId, input);
    res.status(201).json(exp);
  });

  app.delete(api.experience.delete.path, requireAuth, async (req, res) => {
    await storage.deleteExperience(Number(req.params.id));
    res.status(204).send();
  });
  
  // Education routes similar...
  app.post(api.education.create.path, requireAuth, async (req, res) => {
    const input = api.education.create.input.parse(req.body);
    const userId = getUserId(req);
    const edu = await storage.createEducation(userId, input);
    res.status(201).json(edu);
  });

  app.delete(api.education.delete.path, requireAuth, async (req, res) => {
    await storage.deleteEducation(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
