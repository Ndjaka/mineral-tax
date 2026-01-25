import { db } from "../db";
import { promoCodes, promoCodeRedemptions } from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface PromoCode {
    id: number;
    code: string;
    durationMonths: number;
    maxUses: number | null;
    currentUses: number;
    validFrom: Date;
    validUntil: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ValidationResult {
    valid: boolean;
    promoCode?: PromoCode;
    error?: string;
}

/**
 * Validate a promo code
 * Checks: code exists, is active, not expired, has slots available, user hasn't used it
 */
export async function validatePromoCode(
    code: string,
    userId?: string
): Promise<ValidationResult> {
    try {
        // Normalize code to uppercase
        const normalizedCode = code.toUpperCase().trim();

        // Find the promo code
        const [promoCode] = await db
            .select()
            .from(promoCodes)
            .where(eq(promoCodes.code, normalizedCode))
            .limit(1);

        if (!promoCode) {
            return { valid: false, error: "Code invalide" };
        }

        // Check if active
        if (!promoCode.isActive) {
            return { valid: false, error: "Ce code n'est plus actif" };
        }

        // Check if expired
        if (promoCode.validUntil && new Date() > new Date(promoCode.validUntil)) {
            return { valid: false, error: "Ce code a expiré" };
        }

        // Check if max uses reached
        if (promoCode.maxUses !== null && promoCode.currentUses >= promoCode.maxUses) {
            return { valid: false, error: "Ce code n'a plus d'utilisations disponibles" };
        }

        // Check if user has already used this code (if userId provided)
        if (userId) {
            const [existingRedemption] = await db
                .select()
                .from(promoCodeRedemptions)
                .where(
                    and(
                        eq(promoCodeRedemptions.promoCodeId, promoCode.id),
                        eq(promoCodeRedemptions.userId, userId)
                    )
                )
                .limit(1);

            if (existingRedemption) {
                return { valid: false, error: "Vous avez déjà utilisé ce code" };
            }
        }

        return { valid: true, promoCode: promoCode as PromoCode };
    } catch (error) {
        console.error("[PromoCode Service] Error validating promo code:", error);
        console.error("[PromoCode Service] Code was:", code);
        console.error("[PromoCode Service] UserId was:", userId);
        return { valid: false, error: "Erreur lors de la validation du code" };
    }
}

/**
 * Redeem a promo code for a user
 * Creates redemption record and increments usage count
 */
export async function redeemPromoCode(
    code: string,
    userId: string
): Promise<{ success: boolean; error?: string; durationMonths?: number }> {
    try {
        const normalizedCode = code.toUpperCase().trim();

        // Validate first
        const validation = await validatePromoCode(normalizedCode, userId);
        if (!validation.valid || !validation.promoCode) {
            return { success: false, error: validation.error };
        }

        const promoCode = validation.promoCode;

        // Start transaction
        await db.transaction(async (tx) => {
            // Create redemption record
            await tx.insert(promoCodeRedemptions).values({
                promoCodeId: promoCode.id,
                userId: userId,
            });

            // Increment current uses
            await tx
                .update(promoCodes)
                .set({
                    currentUses: sql`${promoCodes.currentUses} + 1`,
                    updatedAt: new Date(),
                })
                .where(eq(promoCodes.id, promoCode.id));
        });

        return {
            success: true,
            durationMonths: promoCode.durationMonths,
        };
    } catch (error) {
        console.error("Error redeeming promo code:", error);
        return { success: false, error: "Erreur lors de l'utilisation du code" };
    }
}

/**
 * Create a free subscription for a user using a promo code
 */
export async function createFreeSubscription(
    userId: string,
    durationMonths: number
): Promise<void> {
    const { subscriptions } = await import("../../shared/schema");

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    await db
        .update(subscriptions)
        .set({
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
            updatedAt: now,
        })
        .where(eq(subscriptions.userId, userId));
}
