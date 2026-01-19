import crypto from "crypto";
import { db } from "../db";
import { emailVerificationTokens, passwordResetTokens } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));

  await db.insert(emailVerificationTokens).values({
    userId,
    token: hashedToken,
    expiresAt,
  });

  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const hashedToken = hashToken(token);

  const [tokenRecord] = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.token, hashedToken),
        gt(emailVerificationTokens.expiresAt, new Date())
      )
    );

  if (!tokenRecord) {
    return null;
  }

  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, tokenRecord.id));

  return tokenRecord.userId;
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));

  await db.insert(passwordResetTokens).values({
    userId,
    token: hashedToken,
    expiresAt,
  });

  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const hashedToken = hashToken(token);

  const [tokenRecord] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, hashedToken),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    );

  if (!tokenRecord) {
    return null;
  }

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, tokenRecord.id));

  return tokenRecord.userId;
}

export function getBaseUrl(): string {
  return process.env.BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}` || "http://localhost:5000";
}
