import { db } from "../server/db";
import { promoCodes } from "../shared/schema";
import { eq } from "drizzle-orm";

async function testValidation() {
    console.log("🧪 Test de validation du code FIDU-FOUNDERS-2026\n");

    try {
        const code = "FIDU-FOUNDERS-2026";
        const normalizedCode = code.toUpperCase().trim();

        console.log("1️⃣  Code normalisé:", normalizedCode);

        const [promoCode] = await db
            .select()
            .from(promoCodes)
            .where(eq(promoCodes.code, normalizedCode))
            .limit(1);

        console.log("\n2️⃣  Code trouvé dans DB:", promoCode ? "OUI ✅" : "NON ❌");

        if (promoCode) {
            console.log("\n📋 Détails du code:");
            console.log("  - ID:", promoCode.id);
            console.log("  - Code:", promoCode.code);
            console.log("  - Duration:", promoCode.durationMonths, "mois");
            console.log("  - Max uses:", promoCode.maxUses);
            console.log("  - Current uses:", promoCode.currentUses);
            console.log("  - Active:", promoCode.isActive);
            console.log("  - Valid until:", promoCode.validUntil);

            console.log("\n3️⃣  Vérifications:");
            console.log("  - Actif?", promoCode.isActive ? "✅" : "❌");
            console.log("  - Expiré?", promoCode.validUntil && new Date() > new Date(promoCode.validUntil) ? "❌ Expiré" : "✅ Valide");
            console.log("  - Places disponibles?", promoCode.maxUses !== null && promoCode.currentUses >= promoCode.maxUses ? "❌ Complet" : "✅ Disponible");

            console.log("\n✅ Le code devrait être validé avec succès!");
        } else {
            console.log("\n❌ Le code n'a pas été trouvé dans la base de données!");
        }

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Erreur pendant le test:", error);
        process.exit(1);
    }
}

testValidation();
