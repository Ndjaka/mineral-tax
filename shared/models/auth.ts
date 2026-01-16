import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const authProviderEnum = pgEnum("auth_provider", ["replit", "local"]);

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table - supports both Replit Auth and local email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"),
  authProvider: authProviderEnum("auth_provider").default("replit"),
  passwordSet: boolean("password_set").default(false),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cross-domain auth token storage for custom domain authentication
export const authTokens = pgTable(
  "auth_tokens",
  {
    token: varchar("token").primaryKey(),
    userData: jsonb("user_data").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [index("IDX_auth_token_expires").on(table.expiresAt)]
);

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const registerUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(12, "Le mot de passe doit contenir au moins 12 caractères"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
