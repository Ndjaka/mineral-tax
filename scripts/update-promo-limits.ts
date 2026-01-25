import { db } from "../server/db";
import { promoCodes } from "../shared/schema";
import { eq, inArray } from "drizzle-orm";

async function updatePromoLimits() {
    console.log("🔄 Mise à jour des limites des codes promo...\n");

    try {
        // Update codes from 3 to 15 users
        const updated15 = await db
            .update(promoCodes)
            .set({
                maxUses: 15,
                updatedAt: new Date()
            })
            .where(
                inArray(promoCodes.code, [
                    'FIDU-FOUNDERS-2026',
                    'MT-AMBASSADEUR',
                    'MT-EARLY-ACCESS-2026'
                ])
            )
            .returning();

        console.log("✅ Codes mis à jour (3 → 15 utilisateurs) :");
        updated15.forEach(code => {
            console.log(`   - ${code.code}: ${code.currentUses}/${code.maxUses} utilisés`);
        });

        // Update code from 5 to 20 users
        const updated20 = await db
            .update(promoCodes)
            .set({
                maxUses: 20,
                updatedAt: new Date()
            })
            .where(eq(promoCodes.code, 'ENTERPRISE-PILOT-2026'))
            .returning();

        console.log("\n✅ Code mis à jour (5 → 20 utilisateurs) :");
        updated20.forEach(code => {
            console.log(`   - ${code.code}: ${code.currentUses}/${code.maxUses} utilisés`);
        });

        // Display total capacity
        const total = updated15.reduce((sum, c) => sum + (c.maxUses || 0), 0) +
            updated20.reduce((sum, c) => sum + (c.maxUses || 0), 0);

        console.log(`\n📊 Capacité totale : ${total} accès partenaires`);
        console.log("\n✨ Mise à jour terminée avec succès !");

        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour :", error);
        process.exit(1);
    }
}

updatePromoLimits();
