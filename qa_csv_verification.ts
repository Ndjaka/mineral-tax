// Script de vérification détaillée du CSV export
import * as fs from 'fs';

console.log('='.repeat(70));
console.log('RAPPORT QA - SCÉNARIO 2 : VÉRIFICATION CSV & CONFORMITÉ OFDF');
console.log('='.repeat(70));
console.log();

const csvContent = fs.readFileSync('test_export.csv', 'utf-8');
const lines = csvContent.split('\n');

console.log('📄 CONTENU DU CSV:');
console.log('─'.repeat(70));
console.log(csvContent);
console.log('─'.repeat(70));
console.log();

// Vérification 1: Structure du CSV
console.log('🔍 VÉRIFICATION 1: STRUCTURE DU CSV');
console.log('─'.repeat(70));

const headerLine = lines[0];
const hasMatricule = headerLine.includes('N° matricule');
const hasChassis = headerLine.includes('N° châssis');

console.log(`   En-tête trouvé: ${headerLine}`);
console.log(`   ✓ Colonne "N° matricule": ${hasMatricule ? '✅ PRÉSENTE' : '❌ ABSENTE'}`);
console.log(`   ✓ Colonne "N° châssis": ${hasChassis ? '✅ PRÉSENTE' : '❌ ABSENTE'}`);
console.log();

// Vérification 2: Métadonnées de conformité
console.log('🔍 VÉRIFICATION 2: MÉTADONNÉES OFDF');
console.log('─'.repeat(70));

const hasReglement09 = csvContent.includes('Règlement 09 de l\'OFDF');
const hasVigueur2026 = csvContent.includes('vigueur 01.01.2026') || csvContent.includes('vigueur 2026');
const hasSourceLegale = csvContent.includes('Source légale');

console.log(`   ✓ Mention "Règlement 09 de l'OFDF": ${hasReglement09 ? '✅ PRÉSENTE' : '❌ ABSENTE'}`);
console.log(`   ✓ Mention "vigueur 01.01.2026": ${hasVigueur2026 ? '✅ PRÉSENTE' : '❌ ABSENTE'}`);
console.log(`   ✓ Mention "Source légale": ${hasSourceLegale ? '✅ PRÉSENTE' : '❌ ABSENTE'}`);
console.log();

// Vérification 3: Calculs et montants
console.log('🔍 VÉRIFICATION 3: CALCULS DANS LE CSV');
console.log('─'.repeat(70));

// Extraire les lignes de données (ignorer header et footer)
const dataLines = lines.filter(line =>
    line &&
    !line.startsWith('#') &&
    !line.startsWith('RC;') &&
    line.includes('FACTURE')
);

console.log(`   Nombre de lignes de données: ${dataLines.length}`);
console.log();

let allCalcsCorrect = true;
for (const line of dataLines) {
    const columns = line.split(';');
    if (columns.length >= 12) {
        const date = columns[5];
        const invoiceNum = columns[6];
        const quantity = columns[7];
        const amount = columns[11];

        console.log(`   📋 ${invoiceNum}:`);
        console.log(`      Date: ${date}`);
        console.log(`      Quantité: ${quantity} L`);
        console.log(`      Montant exporté: ${amount} CHF`);

        // Déterminer le montant attendu selon la date
        let expectedAmount = '0.00';
        if (date.includes('15.12.2025') || date.includes('2025-12-15')) {
            expectedAmount = '340.60';
            console.log(`      Montant attendu: ${expectedAmount} CHF (taux 34.06 CHF/100L)`);
        } else if (date.includes('05.01.2026') || date.includes('2026-01-05')) {
            expectedAmount = '600.50';
            console.log(`      Montant attendu: ${expectedAmount} CHF (taux 60.05 CHF/100L)`);
        }

        const isCorrect = amount === expectedAmount;
        console.log(`      Résultat: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

        if (!isCorrect) {
            allCalcsCorrect = false;
            console.log(`      ⚠️  ERREUR DÉTECTÉE: ${amount} CHF au lieu de ${expectedAmount} CHF`);
        }
        console.log();
    }
}

// Résumé final
console.log('='.repeat(70));
console.log('RÉSUMÉ DES VÉRIFICATIONS');
console.log('='.repeat(70));

const structureOK = hasMatricule && hasChassis;
const metadataOK = hasReglement09 && hasVigueur2026;
const calculationsOK = allCalcsCorrect;

console.log(`   ✓ Structure CSV: ${structureOK ? '✅ CONFORME' : '❌ NON CONFORME'}`);
console.log(`   ✓ Métadonnées OFDF: ${metadataOK ? '✅ CONFORMES' : '❌ NON CONFORMES'}`);
console.log(`   ✓ Calculs export: ${calculationsOK ? '✅ CORRECTS' : '❌ INCORRECTS'}`);
console.log();

console.log('─'.repeat(70));
if (structureOK && metadataOK && calculationsOK) {
    console.log('VERDICT FINAL: ✅ SUCCÈS - CSV conforme à toutes les exigences');
    process.exit(0);
} else {
    console.log('VERDICT FINAL: ❌ ÉCHEC - Problèmes détectés dans le CSV');
    console.log();
    if (!structureOK) console.log('   ⚠️  Structure incomplète');
    if (!metadataOK) console.log('   ⚠️  Métadonnées manquantes ou incorrectes');
    if (!calculationsOK) console.log('   ⚠️  Calculs incorrects dans l\'export');
    process.exit(1);
}
console.log('='.repeat(70));
