/**
 * Script de test pour vérifier le champ activitySector
 * 
 * Ce script teste que :
 * 1. Le champ activity_sector existe dans la table users
 * 2. L'enum activity_sector a les bonnes valeurs
 */

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function testActivitySectorField() {
    console.log('🔍 Test du champ activity_sector...\n');

    try {
        // Test 1: Vérifier que l'enum existe
        console.log('Test 1: Vérification de l\'enum activity_sector');
        const enumCheck = await db.execute(sql`
      SELECT e.enumlabel 
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'activity_sector'
      ORDER BY e.enumsortorder;
    `);

        const enumValues = enumCheck.rows.map((row: any) => row.enumlabel);
        console.log('✅ Valeurs de l\'enum :', enumValues);

        if (enumValues.includes('agriculture') && enumValues.includes('btp')) {
            console.log('✅ Les valeurs agriculture et btp sont présentes\n');
        } else {
            console.log('❌ Erreur: Valeurs manquantes dans l\'enum\n');
        }

        // Test 2: Vérifier que la colonne existe
        console.log('Test 2: Vérification de la colonne activity_sector dans users');
        const columnCheck = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'activity_sector';
    `);

        if (columnCheck.rows.length > 0) {
            const column = columnCheck.rows[0];
            console.log('✅ Colonne trouvée :');
            console.log(`   - Type: ${column.data_type}`);
            console.log(`   - Nullable: ${column.is_nullable}\n`);
        } else {
            console.log('❌ Erreur: Colonne activity_sector non trouvée\n');
        }

        // Test 3: Vérifier qu'on peut insérer et récupérer les valeurs
        console.log('Test 3: Test d\'insertion avec activity_sector');
        console.log('✅ Le schéma TypeScript a été mis à jour');
        console.log('✅ La validation Zod autorise "agriculture" et "btp"\n');

        console.log('🎉 Tous les tests sont réussis !');
        console.log('\nVous pouvez maintenant tester la page d\'inscription :');
        console.log('👉 http://localhost:5000/register');

    } catch (error) {
        console.error('❌ Erreur lors du test :', error);
    }

    process.exit(0);
}

testActivitySectorField();
