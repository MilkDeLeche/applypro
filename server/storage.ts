import { db } from "./db";
import {
  users, experience, education,
  type User, type InsertUser, type Experience, type InsertExperience, type Education, type InsertEducation,
  type UserProfile
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const FREE_TIER_RESUME_LIMIT = 3;
const FREE_TIER_AUTOFILL_LIMIT = 10;
const PERIOD_DAYS = 30;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;

  getProfile(userId: string): Promise<UserProfile>;
  
  createExperience(userId: string, exp: Omit<InsertExperience, "userId">): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;
  
  createEducation(userId: string, edu: Omit<InsertEducation, "userId">): Promise<Education>;
  deleteEducation(id: number): Promise<void>;
  
  // For AI parsing overwrite
  updateProfileWithParsedData(userId: string, data: {
    user: Partial<InsertUser>,
    experience: Omit<InsertExperience, "userId">[],
    education: Omit<InsertEducation, "userId">[]
  }): Promise<UserProfile>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const userExperience = await db.select().from(experience).where(eq(experience.userId, userId));
    const userEducation = await db.select().from(education).where(eq(education.userId, userId));
    
    return {
      user,
      experience: userExperience,
      education: userEducation
    };
  }

  async createExperience(userId: string, exp: Omit<InsertExperience, "userId">): Promise<Experience> {
    const [newExp] = await db.insert(experience).values({ ...exp, userId }).returning();
    return newExp;
  }

  async deleteExperience(id: number): Promise<void> {
    await db.delete(experience).where(eq(experience.id, id));
  }

  async createEducation(userId: string, edu: Omit<InsertEducation, "userId">): Promise<Education> {
    const [newEdu] = await db.insert(education).values({ ...edu, userId }).returning();
    return newEdu;
  }

  async deleteEducation(id: number): Promise<void> {
    await db.delete(education).where(eq(education.id, id));
  }

  async updateProfileWithParsedData(userId: string, data: {
    user: Partial<InsertUser>,
    experience: Omit<InsertExperience, "userId">[],
    education: Omit<InsertEducation, "userId">[]
  }): Promise<UserProfile> {
    if (Object.keys(data.user).length > 0) {
      await this.updateUser(userId, data.user);
    }
    
    await db.delete(experience).where(eq(experience.userId, userId));
    await db.delete(education).where(eq(education.userId, userId));
    
    for (const exp of data.experience) {
      await this.createExperience(userId, exp);
    }
    
    for (const edu of data.education) {
      await this.createEducation(userId, edu);
    }
    
    return this.getProfile(userId);
  }

  async updateStripeInfo(userId: string, info: { stripeCustomerId?: string; stripeSubscriptionId?: string | null }): Promise<User> {
    const [user] = await db.update(users).set(info).where(eq(users.id, userId)).returning();
    return user;
  }

  async incrementResumeParses(userId: string): Promise<void> {
    await db.update(users)
      .set({ resumeParsesThisPeriod: sql`COALESCE(${users.resumeParsesThisPeriod}, 0) + 1` })
      .where(eq(users.id, userId));
  }

  async incrementAutofills(userId: string): Promise<void> {
    await db.update(users)
      .set({ autofillsThisPeriod: sql`COALESCE(${users.autofillsThisPeriod}, 0) + 1` })
      .where(eq(users.id, userId));
  }

  async resetUsageIfNeeded(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user?.periodStart) return;

    const now = new Date();
    const periodStart = new Date(user.periodStart);
    const daysSincePeriodStart = Math.floor((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSincePeriodStart >= PERIOD_DAYS) {
      await db.update(users).set({
        resumeParsesThisPeriod: 0,
        autofillsThisPeriod: 0,
        periodStart: now
      }).where(eq(users.id, userId));
    }
  }

  async canParseResume(userId: string): Promise<{ allowed: boolean; remaining: number; isPremium: boolean }> {
    await this.resetUsageIfNeeded(userId);
    const user = await this.getUser(userId);
    if (!user) return { allowed: false, remaining: 0, isPremium: false };

    const isPremium = !!user.stripeSubscriptionId;
    if (isPremium) return { allowed: true, remaining: -1, isPremium: true };

    const used = user.resumeParsesThisPeriod || 0;
    const remaining = FREE_TIER_RESUME_LIMIT - used;
    return { allowed: remaining > 0, remaining, isPremium: false };
  }

  async canAutofill(userId: string): Promise<{ allowed: boolean; remaining: number; isPremium: boolean }> {
    await this.resetUsageIfNeeded(userId);
    const user = await this.getUser(userId);
    if (!user) return { allowed: false, remaining: 0, isPremium: false };

    const isPremium = !!user.stripeSubscriptionId;
    if (isPremium) return { allowed: true, remaining: -1, isPremium: true };

    const used = user.autofillsThisPeriod || 0;
    const remaining = FREE_TIER_AUTOFILL_LIMIT - used;
    return { allowed: remaining > 0, remaining, isPremium: false };
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  async listProducts() {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = true`
    );
    return result.rows;
  }

  async listPrices() {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE active = true`
    );
    return result.rows;
  }

  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }
}

export const storage = new DatabaseStorage();
