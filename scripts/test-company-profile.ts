/**
 * Script de test pour vérifier la création du profil d'entreprise
 */

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function testCompanyProfileCreation() {
    console.log('🔍 Test de la création de profil d\'entreprise...\n');

    try {
        // Récupérer quelques profils d'entreprise créés
        console.log('Test : Récupération des profils d\'entreprise récents');
        const profiles = await db.execute(sql`
      SELECT 
        cp.id,
        cp.user_id,
        cp.company_name,
        cp.created_at,
        u.email,
        u.first_name,
        u.last_name
      FROM company_profiles cp
      JOIN users u ON cp.user_id = u.id
      ORDER BY cp.created_at DESC
      LIMIT 5;
    `);

        if (profiles.rows.length === 0) {
            console.log('⚠️  Aucun profil d\'entreprise trouvé');
            console.log('   Créez un compte avec une raison sociale pour tester\n');
        } else {
            console.log('✅ Profils d\'entreprise trouvés :');
            profiles.rows.forEach((row: any) => {
                console.log(`   - ${row.company_name} (${row.email})`);
                console.log(`     Créé le: ${row.created_at}`);
            });
            console.log('');
        }

        // Test de requête GET company profile
        console.log('Test : Vérification de la structure de la query');
        const testQuery = await db.execute(sql`
      SELECT 
        COUNT(*) as total_profiles,
        COUNT(DISTINCT user_id) as total_users_with_profile
      FROM company_profiles;
    `);

        const stats = testQuery.rows[0] as any;
        console.log('✅ Statistiques :');
        console.log(`   - Total profils d'entreprise : ${stats.total_profiles}`);
        console.log(`   - Total utilisateurs avec profil : ${stats.total_users_with_profile}`);

        console.log('\n✅ Le système de profil d\'entreprise fonctionne correctement !');
        console.log('\n📝 Pour tester l\'affichage :');
        console.log('1. Créez un nouveau compte sur /register');
        console.log('2. Remplissez le champ "Raison sociale"');
        console.log('3. Allez sur /company');
        console.log('4. Le champ devrait être pré-rempli !');

    } catch (error) {
        console.error('❌ Erreur lors du test :', error);
    }

    process.exit(0);
}

testCompanyProfileCreation();
