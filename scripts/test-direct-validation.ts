import { validatePromoCode } from "../server/services/promoCode";

async function testDirectValidation() {
    console.log("🧪 Test direct de la fonction validatePromoCode\n");

    try {
        console.log("1. Test sans userId (comme un visiteur non connecté):");
        const result1 = await validatePromoCode("FIDU-FOUNDERS-2026", undefined);
        console.log("   Résultat:", result1);

        console.log("\n2. Test avec userId (comme un utilisateur connecté):");
        const result2 = await validatePromoCode("FIDU-FOUNDERS-2026", "test-user-123");
        console.log("   Résultat:", result2);

        process.exit(0);
    } catch (error) {
        console.error("\n❌ ERREUR CAPTURÉE:");
        console.error(error);
        process.exit(1);
    }
}

testDirectValidation();
