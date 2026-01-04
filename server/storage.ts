import { db } from "./db";
import {
  users, experience, education,
  type User, type InsertUser, type Experience, type InsertExperience, type Education, type InsertEducation,
  type UserProfile
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  getProfile(userId: number): Promise<UserProfile>;
  
  createExperience(userId: number, exp: Omit<InsertExperience, "userId">): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;
  
  createEducation(userId: number, edu: Omit<InsertEducation, "userId">): Promise<Education>;
  deleteEducation(id: number): Promise<void>;
  
  // For AI parsing overwrite
  updateProfileWithParsedData(userId: number, data: {
    user: Partial<InsertUser>,
    experience: Omit<InsertExperience, "userId">[],
    education: Omit<InsertEducation, "userId">[]
  }): Promise<UserProfile>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
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

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getProfile(userId: number): Promise<UserProfile> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const userExperience = await db.select().from(experience).where(eq(experience.userId, userId));
    const userEducation = await db.select().from(education).where(eq(education.userId, userId));
    
    return {
      ...user,
      experience: userExperience,
      education: userEducation
    };
  }

  async createExperience(userId: number, exp: Omit<InsertExperience, "userId">): Promise<Experience> {
    const [newExp] = await db.insert(experience).values({ ...exp, userId }).returning();
    return newExp;
  }

  async deleteExperience(id: number): Promise<void> {
    await db.delete(experience).where(eq(experience.id, id));
  }

  async createEducation(userId: number, edu: Omit<InsertEducation, "userId">): Promise<Education> {
    const [newEdu] = await db.insert(education).values({ ...edu, userId }).returning();
    return newEdu;
  }

  async deleteEducation(id: number): Promise<void> {
    await db.delete(education).where(eq(education.id, id));
  }

  async updateProfileWithParsedData(userId: number, data: {
    user: Partial<InsertUser>,
    experience: Omit<InsertExperience, "userId">[],
    education: Omit<InsertEducation, "userId">[]
  }): Promise<UserProfile> {
    // Update basic info if provided
    if (Object.keys(data.user).length > 0) {
      await this.updateUser(userId, data.user);
    }
    
    // Clear existing and add new (simple approach for "overwrite with resume")
    // Or we could append. The prompt says "parse it into a database", usually implies "this is my current resume".
    // I'll clear and replace for simplicity in this MVP.
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
}

export const storage = new DatabaseStorage();
