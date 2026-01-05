import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === SUBSCRIPTION TIERS ===
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  STANDARD: 'standard',
  PRO: 'pro'
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

// === SUPPORTED COUNTRIES ===
export const SUPPORTED_COUNTRIES = {
  US: 'us',
  MX: 'mx',
  CL: 'cl',
  OTHER: 'other'
} as const;

export type SupportedCountry = typeof SUPPORTED_COUNTRIES[keyof typeof SUPPORTED_COUNTRIES];

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  paternalLastName: text("paternal_last_name"),
  maternalLastName: text("maternal_last_name"),
  profileImageUrl: varchar("profile_image_url"),
  linkedin: text("linkedin"),
  portfolio: text("portfolio"),
  phone: text("phone"),
  phoneCountryCode: text("phone_country_code"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  colonia: text("colonia"),
  delegacion: text("delegacion"),
  comuna: text("comuna"),
  region: text("region"),
  rfc: text("rfc"),
  curp: text("curp"),
  rut: text("rut"),
  subscriptionTier: text("subscription_tier").default('free'),
  activeProfileId: integer("active_profile_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  mercadopagoSubscriptionId: text("mercadopago_subscription_id"),
  lemonSqueezySubscriptionId: text("lemonsqueezy_subscription_id"),
  paymentProvider: text("payment_provider"),
  resumeParsesThisPeriod: integer("resume_parses_this_period").default(0),
  autofillsThisPeriod: integer("autofills_this_period").default(0),
  periodStart: timestamp("period_start").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull().default('Default'),
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const experience = pgTable("experience", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  profileId: integer("profile_id").references(() => profiles.id),
  company: text("company").notNull(),
  title: text("title").notNull(),
  titleEnglish: text("title_english"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  description: text("description"),
  descriptionEnglish: text("description_english"),
  location: text("location"),
});

export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  profileId: integer("profile_id").references(() => profiles.id),
  school: text("school").notNull(),
  degree: text("degree"),
  degreeEnglish: text("degree_english"),
  major: text("major"),
  majorEnglish: text("major_english"),
  gradYear: text("grad_year"),
  location: text("location"),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many, one }) => ({
  profiles: many(profiles),
  experience: many(experience),
  education: many(education),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  experience: many(experience),
  education: many(education),
}));

export const experienceRelations = relations(experience, ({ one }) => ({
  user: one(users, {
    fields: [experience.userId],
    references: [users.id],
  }),
  profile: one(profiles, {
    fields: [experience.profileId],
    references: [profiles.id],
  }),
}));

export const educationRelations = relations(education, ({ one }) => ({
  user: one(users, {
    fields: [education.userId],
    references: [users.id],
  }),
  profile: one(profiles, {
    fields: [education.profileId],
    references: [profiles.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const insertExperienceSchema = createInsertSchema(experience).omit({ id: true });
export const insertEducationSchema = createInsertSchema(education).omit({ id: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Experience = typeof experience.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;

export type Education = typeof education.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;

// === API CONTRACT TYPES ===

export type ResumeProfile = {
  profile: Profile;
  experience: Experience[];
  education: Education[];
};

export type UserProfile = {
  user: User;
  profiles: ResumeProfile[];
  activeProfile: ResumeProfile | null;
};

export type UpdateProfileRequest = Partial<InsertUser>;
