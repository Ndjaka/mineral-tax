/**
 * Script pour déboguer le problème d'affichage du profil d'entreprise
 */

import { db } from '../server/db.js';
import { users, companyProfiles } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function debugCompanyProfile() {
    console.log('🔍 Débogage du profil d\'entreprise non affiché\n');
    console.log('='.repeat(60));

    try {
        // Lister tous les utilisateurs avec leur profil
        console.log('\n📋 Liste de tous les utilisateurs et leurs profils :\n');

        const allUsers = await db.select().from(users);

        for (const user of allUsers) {
            const [profile] = await db
                .select()
                .from(companyProfiles)
                .where(eq(companyProfiles.userId, user.id));

            console.log(`👤 ${user.email}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Nom: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
            console.log(`   Secteur: ${user.activitySector || 'N/A'}`);
            console.log(`   Email vérifié: ${user.emailVerified ? 'Oui' : 'Non'}`);

            if (profile) {
                console.log(`   ✅ Profil d'entreprise: "${profile.companyName}"`);
            } else {
                console.log(`   ❌ Pas de profil d'entreprise`);
            }
            console.log('');
        }

        // Tester l'API directement
        console.log('='.repeat(60));
        console.log('\n🔬 Test de l\'API /api/company-profile\n');

        const response = await fetch('http://localhost:5000/api/company-profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Status: ${response.status}`);

        if (response.ok) {
            const data = await response.json();
            console.log('Données reçues:', data);
        } else {
            console.log(`Erreur: ${response.status} ${response.statusText}`);
            const text = await response.text();
            if (text) {
                console.log('Message:', text);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n💡 Conseils de débogage:\n');
        console.log('1. Vérifiez que vous êtes connecté au bon compte');
        console.log('2. Utilisez le bon port : http://localhost:5000 (pas 3000)');
        console.log('3. Ouvrez la console du navigateur (F12) et vérifiez:');
        console.log('   - Onglet Network : la requête /api/company-profile');
        console.log('   - Onglet Application : les cookies de session');
        console.log('4. Si le problème persiste, déconnectez-vous et reconnectez-vous');

    } catch (error) {
        console.error('\n❌ Erreur:', error);
    }

    process.exit(0);
}

debugCompanyProfile();
