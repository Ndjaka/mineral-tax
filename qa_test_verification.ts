import { calculateReimbursementBySectorAndDate } from './shared/schema';

console.log('='.repeat(70));
console.log('RAPPORT QA - TEST SCÉNARIO 1 : VÉRIFICATION DU PIVOT DE DATE');
console.log('='.repeat(70));
console.log();

// Test FACTURE A: 15.12.2025, 1000L Diesel, Secteur Agriculture
const factureA_date = new Date('2025-12-15T00:00:00.000Z');
const factureA_volume = 1000;
const factureA_sector = 'agriculture_with_direct';
const factureA_fuelType = 'diesel';

const montantA = calculateReimbursementBySectorAndDate(
    factureA_volume,
    factureA_date,
    factureA_sector,
    factureA_fuelType
);

console.log('📋 FACTURE A (Avant 2026 - Ancien Taux)');
console.log('─'.repeat(70));
console.log(`   Date de facture    : ${factureA_date.toISOString().split('T')[0]}`);
console.log(`   Quantité           : ${factureA_volume} litres`);
console.log(`   Type de carburant  : ${factureA_fuelType}`);
console.log(`   Secteur            : ${factureA_sector}`);
console.log(`   Taux attendu       : 34.06 CHF/100L (0.3406 CHF/L)`);
console.log(`   Montant attendu    : 340.60 CHF`);
console.log(`   Montant calculé    : ${montantA.toFixed(2)} CHF`);
console.log(`   Résultat           : ${montantA === 340.60 ? '✅ PASS' : '❌ FAIL'}`);
console.log();

// Test FACTURE B: 05.01.2026, 1000L Diesel, Secteur Agriculture
const factureB_date = new Date('2026-01-05T00:00:00.000Z');
const factureB_volume = 1000;
const factureB_sector = 'agriculture_with_direct';
const factureB_fuelType = 'diesel';

const montantB = calculateReimbursementBySectorAndDate(
    factureB_volume,
    factureB_date,
    factureB_sector,
    factureB_fuelType
);

console.log('📋 FACTURE B (Après 2026 - Nouveau Taux)');
console.log('─'.repeat(70));
console.log(`   Date de facture    : ${factureB_date.toISOString().split('T')[0]}`);
console.log(`   Quantité           : ${factureB_volume} litres`);
console.log(`   Type de carburant  : ${factureB_fuelType}`);
console.log(`   Secteur            : ${factureB_sector}`);
console.log(`   Taux attendu       : 60.05 CHF/100L (0.6005 CHF/L)`);
console.log(`   Montant attendu    : 600.50 CHF`);
console.log(`   Montant calculé    : ${montantB.toFixed(2)} CHF`);
console.log(`   Résultat           : ${montantB === 600.50 ? '✅ PASS' : '❌ FAIL'}`);
console.log();

console.log('='.repeat(70));
console.log('CRITÈRE DE SUCCÈS');
console.log('='.repeat(70));
const successCriteria = montantA === 340.60 && montantB === 600.50 && montantA !== montantB;
console.log(`Le Dashboard affiche-t-il bien deux montants différents`);
console.log(`pour une même quantité selon la date ?`);
console.log();
console.log(`   Montant Facture A  : ${montantA.toFixed(2)} CHF`);
console.log(`   Montant Facture B  : ${montantB.toFixed(2)} CHF`);
console.log(`   Montants différents: ${montantA !== montantB ? '✅ OUI' : '❌ NON'}`);
console.log();
console.log('─'.repeat(70));
console.log(`VERDICT FINAL: ${successCriteria ? '✅ SUCCÈS - Le pivot de date fonctionne correctement' : '❌ ÉCHEC - Le pivot de date ne fonctionne pas'}`);
console.log('='.repeat(70));

process.exit(successCriteria ? 0 : 1);
