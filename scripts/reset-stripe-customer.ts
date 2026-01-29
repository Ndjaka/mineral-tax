import { db, pool } from "../server/db";
import { subscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Script pour réinitialiser les IDs Stripe des clients
 * Utile lors du passage de clés LIVE à TEST
 */

async function resetStripeCustomers() {
    try {
        console.log("🔧 Réinitialisation des IDs clients Stripe...");

        // Réinitialiser tous les stripeCustomerId et stripeSubscriptionId
        const result = await db
            .update(subscriptions)
            .set({
                stripeCustomerId: null,
                stripeSubscriptionId: null,
            })
            .where(eq(subscriptions.status, "trial")); // Uniquement les utilisateurs en trial

        console.log("✅ Réinitialisation terminée");
        console.log("ℹ️  Les IDs clients seront recréés automatiquement au prochain paiement");

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur:", error);
        await pool.end();
        process.exit(1);
    }
}

resetStripeCustomers();
