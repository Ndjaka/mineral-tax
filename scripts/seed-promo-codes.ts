import { db } from "../server/db";
import { promoCodes } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedPromoCodes() {
    console.log("🌱 Initialisation des codes promo...\n");

    const codes = [
        {
            code: 'FIDU-FOUNDERS-2026',
            durationMonths: 12,
            maxUses: 15,
            validUntil: new Date('2027-06-25 23:59:59'),
            description: 'Partenaires fiduciaires fondateurs'
        },
        {
            code: 'MT-AMBASSADEUR',
            durationMonths: 12,
            maxUses: 15,
            validUntil: new Date('2027-06-25 23:59:59'),
            description: 'Ambassadeurs MineralTax'
        },
        {
            code: 'MT-EARLY-ACCESS-2026',
            durationMonths: 12,
            maxUses: 15,
            validUntil: new Date('2027-06-25 23:59:59'),
            description: 'Accès anticipé partenaires'
        },
        {
            code: 'ENTERPRISE-PILOT-2026',
            durationMonths: 12,
            maxUses: 20,
            validUntil: new Date('2027-06-25 23:59:59'),
            description: 'Programme pilote entreprise'
        }
    ];

    try {
        for (const codeData of codes) {
            // Check if code already exists
            const existing = await db
                .select()
                .from(promoCodes)
                .where(eq(promoCodes.code, codeData.code))
                .limit(1);

            if (existing.length > 0) {
                console.log(`⚠️  ${codeData.code} existe déjà (${existing[0].currentUses}/${existing[0].maxUses} utilisés)`);
            } else {
                await db.insert(promoCodes).values({
                    code: codeData.code,
                    durationMonths: codeData.durationMonths,
                    maxUses: codeData.maxUses,
                    currentUses: 0,
                    validFrom: new Date(),
                    validUntil: codeData.validUntil,
                    isActive: true,
                });
                console.log(`✅ ${codeData.code} créé (0/${codeData.maxUses} - ${codeData.description})`);
            }
        }

        // Display summary
        console.log("\n📊 Résumé des codes promo :");
        const allCodes = await db.select().from(promoCodes);

        let totalCapacity = 0;
        allCodes.forEach(code => {
            const available = (code.maxUses || 0) - code.currentUses;
            totalCapacity += (code.maxUses || 0);
            console.log(`   ${code.code}: ${code.currentUses}/${code.maxUses} utilisés (${available} disponibles)`);
        });

        console.log(`\n✨ Capacité totale : ${totalCapacity} accès partenaires`);
        console.log("🎉 Initialisation terminée avec succès !\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation :", error);
        process.exit(1);
    }
}

seedPromoCodes();
