import { db } from "../server/db";
import { promoCodes } from "../shared/schema";
import { inArray } from "drizzle-orm";

async function updatePromoLimits() {
    console.log("🔄 Mise à jour des limites des codes promo à 5 utilisateurs...\n");

    try {
        // Update ALL codes to 5 users
        const updated = await db
            .update(promoCodes)
            .set({
                maxUses: 5,
                updatedAt: new Date()
            })
            .where(
                inArray(promoCodes.code, [
                    'FIDU-FOUNDERS-2026',
                    'MT-AMBASSADEUR',
                    'MT-EARLY-ACCESS-2026',
                    'ENTERPRISE-PILOT-2026'
                ])
            )
            .returning();

        console.log("✅ Tous les codes mis à jour (→ 5 utilisateurs max) :");
        updated.forEach(code => {
            console.log(`   - ${code.code}: ${code.currentUses}/${code.maxUses} utilisés`);
        });

        // Display total capacity
        const total = updated.reduce((sum, c) => sum + (c.maxUses || 0), 0);

        console.log(`\n📊 Capacité totale : ${total} accès partenaires (4 codes × 5)`);
        console.log("\n✨ Mise à jour terminée avec succès !");

        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour :", error);
        process.exit(1);
    }
}

updatePromoLimits();
