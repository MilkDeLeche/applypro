import { db } from "./db";
import {
  users, experience, education, profiles,
  type User, type InsertUser, type Experience, type InsertExperience, type Education, type InsertEducation,
  type Profile, type InsertProfile, type UserProfile, type ResumeProfile, SUBSCRIPTION_TIERS, type SubscriptionTier
} from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

const FREE_TIER_RESUME_LIMIT = 3;
const FREE_TIER_AUTOFILL_LIMIT = 10;
const PERIOD_DAYS = 30;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;

  getUserProfile(userId: string): Promise<UserProfile>;
  
  // Profile management
  createProfile(userId: string, name: string): Promise<Profile>;
  getProfiles(userId: string): Promise<Profile[]>;
  getResumeProfile(profileId: number): Promise<ResumeProfile | null>;
  deleteProfile(profileId: number): Promise<void>;
  renameProfile(profileId: number, name: string): Promise<Profile>;
  setActiveProfile(userId: string, profileId: number): Promise<void>;
  
  createExperience(profileId: number, exp: Omit<InsertExperience, "userId" | "profileId">): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;
  
  createEducation(profileId: number, edu: Omit<InsertEducation, "userId" | "profileId">): Promise<Education>;
  deleteEducation(id: number): Promise<void>;
  
  // For AI parsing overwrite
  updateProfileWithParsedData(userId: string, profileId: number, data: {
    user: Partial<InsertUser>,
    experience: Omit<InsertExperience, "userId" | "profileId">[],
    education: Omit<InsertEducation, "userId" | "profileId">[]
  }): Promise<ResumeProfile>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.execute(sql`SELECT * FROM users WHERE email = ${username} LIMIT 1`);
    return result.rows[0] as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    const [profile] = await db.insert(profiles).values({ userId: user.id, name: 'Default Resume' }).returning();
    await db.update(users).set({ activeProfileId: profile.id }).where(eq(users.id, user.id));
    return this.getUser(user.id) as Promise<User>;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const userProfiles = await db.select().from(profiles).where(eq(profiles.userId, userId));
    
    const resumeProfiles: ResumeProfile[] = await Promise.all(
      userProfiles.map(async (p) => {
        const exp = await db.select().from(experience).where(eq(experience.profileId, p.id));
        const edu = await db.select().from(education).where(eq(education.profileId, p.id));
        return { profile: p, experience: exp, education: edu };
      })
    );
    
    const activeProfile = user?.activeProfileId 
      ? resumeProfiles.find(rp => rp.profile.id === user.activeProfileId) || null
      : resumeProfiles[0] || null;
    
    return {
      user,
      profiles: resumeProfiles,
      activeProfile
    };
  }

  async createProfile(userId: string, name: string): Promise<Profile> {
    const [profile] = await db.insert(profiles).values({ userId, name }).returning();
    return profile;
  }

  async getProfiles(userId: string): Promise<Profile[]> {
    return db.select().from(profiles).where(eq(profiles.userId, userId));
  }

  async getResumeProfile(profileId: number): Promise<ResumeProfile | null> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
    if (!profile) return null;
    
    const exp = await db.select().from(experience).where(eq(experience.profileId, profileId));
    const edu = await db.select().from(education).where(eq(education.profileId, profileId));
    
    return { profile, experience: exp, education: edu };
  }

  async deleteProfile(profileId: number): Promise<void> {
    await db.delete(experience).where(eq(experience.profileId, profileId));
    await db.delete(education).where(eq(education.profileId, profileId));
    await db.delete(profiles).where(eq(profiles.id, profileId));
  }

  async renameProfile(profileId: number, name: string): Promise<Profile> {
    const [profile] = await db.update(profiles).set({ name }).where(eq(profiles.id, profileId)).returning();
    return profile;
  }

  async setActiveProfile(userId: string, profileId: number): Promise<void> {
    await db.update(users).set({ activeProfileId: profileId }).where(eq(users.id, userId));
  }

  async createExperience(profileId: number, exp: Omit<InsertExperience, "userId" | "profileId">): Promise<Experience> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
    const [newExp] = await db.insert(experience).values({ ...exp, userId: profile.userId, profileId }).returning();
    return newExp;
  }

  async deleteExperience(id: number): Promise<void> {
    await db.delete(experience).where(eq(experience.id, id));
  }

  async createEducation(profileId: number, edu: Omit<InsertEducation, "userId" | "profileId">): Promise<Education> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
    const [newEdu] = await db.insert(education).values({ ...edu, userId: profile.userId, profileId }).returning();
    return newEdu;
  }

  async deleteEducation(id: number): Promise<void> {
    await db.delete(education).where(eq(education.id, id));
  }

  async updateProfileWithParsedData(userId: string, profileId: number, data: {
    user: Partial<InsertUser>,
    experience: Omit<InsertExperience, "userId" | "profileId">[],
    education: Omit<InsertEducation, "userId" | "profileId">[]
  }): Promise<ResumeProfile> {
    if (Object.keys(data.user).length > 0) {
      await this.updateUser(userId, data.user);
    }
    
    await db.delete(experience).where(eq(experience.profileId, profileId));
    await db.delete(education).where(eq(education.profileId, profileId));
    
    for (const exp of data.experience) {
      await this.createExperience(profileId, exp);
    }
    
    for (const edu of data.education) {
      await this.createEducation(profileId, edu);
    }
    
    return this.getResumeProfile(profileId) as Promise<ResumeProfile>;
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

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  async resetUsage(userId: string): Promise<void> {
    await db.update(users).set({
      resumeParsesThisPeriod: 0,
      autofillsThisPeriod: 0,
      periodStart: new Date()
    }).where(eq(users.id, userId));
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

  getMaxProfiles(tier: SubscriptionTier): number {
    switch (tier) {
      case SUBSCRIPTION_TIERS.PRO: return 5;
      case SUBSCRIPTION_TIERS.STANDARD: return 1;
      case SUBSCRIPTION_TIERS.FREE: return 1;
      default: return 1;
    }
  }

  async canCreateProfile(userId: string): Promise<{ allowed: boolean; maxProfiles: number; currentCount: number }> {
    const user = await this.getUser(userId);
    if (!user) return { allowed: false, maxProfiles: 1, currentCount: 0 };

    const tier = (user.subscriptionTier as SubscriptionTier) || SUBSCRIPTION_TIERS.FREE;
    const maxProfiles = this.getMaxProfiles(tier);
    const existingProfiles = await this.getProfiles(userId);
    const currentCount = existingProfiles.length;

    return { allowed: currentCount < maxProfiles, maxProfiles, currentCount };
  }

  async updateSubscriptionTier(userId: string, tier: SubscriptionTier): Promise<User> {
    const [user] = await db.update(users).set({ subscriptionTier: tier }).where(eq(users.id, userId)).returning();
    return user;
  }

  async clearProfileData(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    // Get user's active profile
    const activeProfileId = user.activeProfileId;
    if (activeProfileId) {
      // Delete all experience and education for the active profile
      await db.delete(experience).where(eq(experience.profileId, activeProfileId));
      await db.delete(education).where(eq(education.profileId, activeProfileId));
    }

    // Clear user's personal info fields (but keep account)
    await db.update(users).set({
      firstName: null,
      lastName: null,
      paternalLastName: null,
      maternalLastName: null,
      phone: null,
      phoneCountryCode: null,
      linkedin: null,
      portfolio: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      country: null,
      colonia: null,
      delegacion: null,
      comuna: null,
      region: null,
      rfc: null,
      curp: null,
      rut: null
    }).where(eq(users.id, userId));
  }

  async deleteAccount(userId: string): Promise<void> {
    // Get all user's profiles
    const userProfiles = await this.getProfiles(userId);
    
    // Delete all experience and education for each profile
    for (const profile of userProfiles) {
      await db.delete(experience).where(eq(experience.profileId, profile.id));
      await db.delete(education).where(eq(education.profileId, profile.id));
    }
    
    // Delete all profiles
    await db.delete(profiles).where(eq(profiles.userId, userId));
    
    // Delete the user
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
