import type { Express } from "express";
import { requireSupabaseAuth, getUserId } from "./supabaseAuth";

export async function setupAuth(_app: Express) {
  // Supabase Auth is stateless (JWT). No session/passport setup needed.
  // Auth is validated per-request via Authorization: Bearer <token>
}

export function registerAuthRoutes(app: Express) {
  app.get("/api/auth/user", requireSupabaseAuth, (req, res) => {
    const user = (req as any).user;
    if (!user?.appUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(user.appUser);
  });
}

export { requireSupabaseAuth as requireAuth, getUserId } from "./supabaseAuth";
