import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "../db";
import { users, luciaSessions } from "@shared/schema";
import type { User } from "@shared/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, luciaSessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      emailVerified: attributes.emailVerified,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
      profileImageUrl: attributes.profileImageUrl,
      activitySector: attributes.activitySector,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string | null;
  emailVerified: boolean | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  activitySector: "agriculture" | "btp" | null;
}

export type { User };
