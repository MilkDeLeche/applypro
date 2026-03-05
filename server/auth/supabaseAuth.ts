import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../supabase";
import { db } from "../db";
import { users, profiles } from "@shared/schema";
import { eq } from "drizzle-orm";

export type AuthUser = {
  id: string;
  email?: string;
  appUser?: typeof users.$inferSelect;
};

/**
 * Middleware: Extract Bearer token from Authorization header and validate with Supabase.
 * Sets req.user with { id, email, appUser } on success.
 */
export async function requireSupabaseAuth(
  req: Request & { user?: AuthUser },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({
      message: "Auth not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  try {
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Ensure app user exists (sync from Supabase auth)
    const [existingUser] = await db.select().from(users).where(eq(users.id, supabaseUser.id));
    let appUser = existingUser;

    if (!appUser) {
      const [created] = await db
        .insert(users)
        .values({
          id: supabaseUser.id,
          email: supabaseUser.email ?? undefined,
          firstName: supabaseUser.user_metadata?.first_name ?? supabaseUser.user_metadata?.name?.split(" ")[0],
          lastName: supabaseUser.user_metadata?.last_name ?? supabaseUser.user_metadata?.name?.split(" ").slice(1).join(" "),
          profileImageUrl: supabaseUser.user_metadata?.avatar_url ?? supabaseUser.user_metadata?.picture,
        })
        .returning();

      if (created) {
        const [profile] = await db.insert(profiles).values({ userId: created.id, name: "Default Resume" }).returning();
        if (profile) {
          await db.update(users).set({ activeProfileId: profile.id }).where(eq(users.id, created.id));
          appUser = { ...created, activeProfileId: profile.id };
        } else {
          appUser = created;
        }
      }
    }

    req.user = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      appUser,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function getUserId(req: Request & { user?: AuthUser }): string {
  if (!req.user) throw new Error("User not authenticated");
  return req.user.id;
}
