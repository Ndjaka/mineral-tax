import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

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

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
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
