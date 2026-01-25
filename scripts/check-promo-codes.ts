import { db } from "../server/db";
import { promoCodes } from "../shared/schema";

async function checkPromoCodes() {
    console.log("🔍 Vérification des codes promo...\n");

    try {
        const codes = await db.select().from(promoCodes);

        if (codes.length === 0) {
            console.log("❌ Aucun code promo trouvé dans la base de données !");
            console.log("\n💡 Exécutez: npm run seed-promo-codes\n");
        } else {
            console.log(`✅ ${codes.length} code(s) promo trouvé(s) :\n`);
            codes.forEach(code => {
                console.log(`Code: ${code.code}`);
                console.log(`  - Max uses: ${code.maxUses}`);
                console.log(`  - Current uses: ${code.currentUses}`);
                console.log(`  - Active: ${code.isActive}`);
                console.log(`  - Valid until: ${code.validUntil}`);
                console.log("");
            });
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de la vérification :", error);
        process.exit(1);
    }
}

checkPromoCodes();
