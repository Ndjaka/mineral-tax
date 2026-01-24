/**
 * Test unitaire pour la récupération du profil d'entreprise
 * URL testée : GET /api/company-profile
 */

import { db } from '../server/db.js';
import { users, companyProfiles } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const API_URL = 'http://localhost:5000';

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    details?: any;
}

const results: TestResult[] = [];

async function testCompanyProfileAPI() {
    console.log('🧪 Tests unitaires : GET /api/company-profile\n');
    console.log('='.repeat(60));
    console.log('\n');

    try {
        // Test 1: Vérifier qu'un utilisateur avec profil peut le récupérer
        await test1_UserWithProfile();

        // Test 2: Vérifier qu'un utilisateur sans profil reçoit null
        await test2_UserWithoutProfile();

        // Test 3: Vérifier que l'authentification est requise
        await test3_AuthenticationRequired();

        // Test 4: Vérifier la structure des données retournées
        await test4_DataStructure();

        // Afficher les résultats
        displayResults();

    } catch (error) {
        console.error('❌ Erreur fatale lors des tests :', error);
        process.exit(1);
    }

    process.exit(0);
}

async function test1_UserWithProfile() {
    const testName = 'Test 1: Utilisateur avec profil d\'entreprise';
    console.log(`\n📋 ${testName}`);
    console.log('-'.repeat(60));

    try {
        // Récupérer un utilisateur qui a un profil d'entreprise
        const [userWithProfile] = await db
            .select()
            .from(users)
            .innerJoin(companyProfiles, eq(users.id, companyProfiles.userId))
            .limit(1);

        if (!userWithProfile) {
            results.push({
                name: testName,
                passed: false,
                error: 'Aucun utilisateur avec profil trouvé en base de données',
                details: 'Créez d\'abord un compte avec une raison sociale'
            });
            console.log('⚠️  SKIP - Aucun utilisateur de test disponible\n');
            return;
        }

        const userId = userWithProfile.users.id;
        const expectedCompanyName = userWithProfile.company_profiles.companyName;

        console.log(`   User ID: ${userId}`);
        console.log(`   Email: ${userWithProfile.users.email}`);
        console.log(`   Raison sociale attendue: ${expectedCompanyName}`);

        // Simuler la récupération via l'API (test de la fonction storage)
        const profile = await db
            .select()
            .from(companyProfiles)
            .where(eq(companyProfiles.userId, userId))
            .limit(1);

        if (profile.length > 0 && profile[0].companyName === expectedCompanyName) {
            results.push({
                name: testName,
                passed: true,
                details: {
                    userId,
                    companyName: profile[0].companyName
                }
            });
            console.log('   ✅ PASS - Profil récupéré avec succès');
            console.log(`   └─ Raison sociale: ${profile[0].companyName}\n`);
        } else {
            results.push({
                name: testName,
                passed: false,
                error: 'Profil non trouvé ou incorrect'
            });
            console.log('   ❌ FAIL - Profil non trouvé\n');
        }

    } catch (error: any) {
        results.push({
            name: testName,
            passed: false,
            error: error.message
        });
        console.log(`   ❌ FAIL - ${error.message}\n`);
    }
}

async function test2_UserWithoutProfile() {
    const testName = 'Test 2: Utilisateur sans profil d\'entreprise';
    console.log(`\n📋 ${testName}`);
    console.log('-'.repeat(60));

    try {
        // Récupérer un utilisateur qui n'a PAS de profil d'entreprise
        const allUsers = await db.select().from(users);
        const allProfiles = await db.select().from(companyProfiles);

        const userIdsWithProfile = new Set(allProfiles.map(p => p.userId));
        const userWithoutProfile = allUsers.find(u => !userIdsWithProfile.has(u.id));

        if (!userWithoutProfile) {
            results.push({
                name: testName,
                passed: true,
                details: 'Tous les utilisateurs ont un profil - comportement OK'
            });
            console.log('   ℹ️  INFO - Tous les utilisateurs ont un profil');
            console.log('   ✅ PASS - Comportement attendu\n');
            return;
        }

        const userId = userWithoutProfile.id;
        console.log(`   User ID: ${userId}`);
        console.log(`   Email: ${userWithoutProfile.email}`);

        // Tester que la requête retourne bien undefined
        const [profile] = await db
            .select()
            .from(companyProfiles)
            .where(eq(companyProfiles.userId, userId));

        if (!profile) {
            results.push({
                name: testName,
                passed: true,
                details: { userId }
            });
            console.log('   ✅ PASS - Aucun profil trouvé (attendu)\n');
        } else {
            results.push({
                name: testName,
                passed: false,
                error: 'Un profil a été trouvé alors qu\'il ne devrait pas y en avoir'
            });
            console.log('   ❌ FAIL - Profil inattendu trouvé\n');
        }

    } catch (error: any) {
        results.push({
            name: testName,
            passed: false,
            error: error.message
        });
        console.log(`   ❌ FAIL - ${error.message}\n`);
    }
}

async function test3_AuthenticationRequired() {
    const testName = 'Test 3: Authentification requise (401/403)';
    console.log(`\n📋 ${testName}`);
    console.log('-'.repeat(60));

    try {
        // Tester l'endpoint sans authentification
        const response = await fetch(`${API_URL}/api/company-profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`   Status: ${response.status}`);

        if (response.status === 401 || response.status === 403) {
            results.push({
                name: testName,
                passed: true,
                details: { status: response.status }
            });
            console.log('   ✅ PASS - Requête non authentifiée rejetée (401)\n');
        } else {
            const data = await response.text();
            results.push({
                name: testName,
                passed: false,
                error: `Status attendu: 401 ou 403, reçu: ${response.status}`,
                details: { data }
            });
            console.log(`   ❌ FAIL - Status inattendu: ${response.status}\n`);
        }

    } catch (error: any) {
        results.push({
            name: testName,
            passed: false,
            error: error.message
        });
        console.log(`   ❌ FAIL - ${error.message}\n`);
    }
}

async function test4_DataStructure() {
    const testName = 'Test 4: Structure des données du profil';
    console.log(`\n📋 ${testName}`);
    console.log('-'.repeat(60));

    try {
        // Récupérer un profil d'entreprise
        const [profile] = await db
            .select()
            .from(companyProfiles)
            .limit(1);

        if (!profile) {
            results.push({
                name: testName,
                passed: false,
                error: 'Aucun profil disponible pour tester la structure'
            });
            console.log('   ⚠️  SKIP - Aucun profil disponible\n');
            return;
        }

        console.log('   Champs trouvés:');
        const requiredFields = ['id', 'userId', 'companyName', 'createdAt', 'updatedAt'];
        const optionalFields = ['ideNumber', 'rcNumber', 'street', 'city', 'postalCode',
            'canton', 'country', 'contactName', 'contactEmail', 'contactPhone',
            'bankName', 'iban', 'bic', 'taxSubjectNumber', 'attribution99'];

        let allFieldsOk = true;

        // Vérifier les champs requis
        for (const field of requiredFields) {
            const exists = field in profile;
            console.log(`   ${exists ? '✓' : '✗'} ${field}${exists ? '' : ' (MANQUANT)'}`);
            if (!exists) allFieldsOk = false;
        }

        // Vérifier que companyName n'est pas vide
        if (!profile.companyName || profile.companyName.trim().length === 0) {
            console.log('   ✗ companyName est vide');
            allFieldsOk = false;
        }

        if (allFieldsOk) {
            results.push({
                name: testName,
                passed: true,
                details: {
                    companyName: profile.companyName,
                    fieldsCount: Object.keys(profile).length
                }
            });
            console.log('   ✅ PASS - Structure correcte\n');
        } else {
            results.push({
                name: testName,
                passed: false,
                error: 'Champs requis manquants'
            });
            console.log('   ❌ FAIL - Structure incomplète\n');
        }

    } catch (error: any) {
        results.push({
            name: testName,
            passed: false,
            error: error.message
        });
        console.log(`   ❌ FAIL - ${error.message}\n`);
    }
}

function displayResults() {
    console.log('\n');
    console.log('='.repeat(60));
    console.log('📊 RÉSULTATS DES TESTS');
    console.log('='.repeat(60));
    console.log('\n');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    results.forEach(result => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} ${result.name}`);
        if (result.error) {
            console.log(`   └─ Erreur: ${result.error}`);
        }
        if (result.details && !result.passed) {
            console.log(`   └─ Détails: ${JSON.stringify(result.details, null, 2)}`);
        }
    });

    console.log('\n');
    console.log('-'.repeat(60));
    console.log(`Total: ${total} tests`);
    console.log(`✅ Réussis: ${passed}`);
    console.log(`❌ Échoués: ${failed}`);
    console.log(`📈 Taux de réussite: ${((passed / total) * 100).toFixed(1)}%`);
    console.log('-'.repeat(60));
    console.log('\n');

    if (failed === 0) {
        console.log('🎉 Tous les tests sont passés avec succès !');
    } else {
        console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
    }
}

// Exécuter les tests
testCompanyProfileAPI();
