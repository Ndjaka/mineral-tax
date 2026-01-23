// Script de diagnostic détaillé pour comprendre le bug CSV
import { calculateReimbursementBySectorAndDate } from './shared/schema';

console.log('='.repeat(70));
console.log('DIAGNOSTIC DU BUG CSV');
console.log('='.repeat(70));
console.log();

// Test manuel avec les données exactes
const facture_A = {
    date: new Date('2025-12-15T00:00:00.000Z'),
    volume: 1000,
    sector: 'agriculture_with_direct',
    fuelType: 'diesel'
};

const facture_B = {
    date: new Date('2026-01-05T00:00:00.000Z'),
    volume: 1000,
    sector: 'agriculture_with_direct',
    fuelType: 'diesel'
};

console.log('🔍 Test manuel de la fonction calculateReimbursementBySectorAndDate:');
console.log('─'.repeat(70));

const calc_A = calculateReimbursementBySectorAndDate(
    facture_A.volume,
    facture_A.date,
    facture_A.sector,
    facture_A.fuelType
);

const calc_B = calculateReimbursementBySectorAndDate(
    facture_B.volume,
    facture_B.date,
    facture_B.sector,
    facture_B.fuelType
);

console.log(`Facture A (${facture_A.date.toISOString().split('T')[0]}): ${calc_A.toFixed(2)} CHF`);
console.log(`Facture B (${facture_B.date.toISOString().split('T')[0]}): ${calc_B.toFixed(2)} CHF`);
console.log();

// Test avec sector undefined ou null  
console.log('🔍 Test avec sector=undefined (simule machine sans taxasActivity):');
console.log('─'.repeat(70));

const calc_A_no_sector = calculateReimbursementBySectorAndDate(
    facture_A.volume,
    facture_A.date,
    undefined,
    facture_A.fuelType
);

const calc_B_no_sector = calculateReimbursementBySectorAndDate(
    facture_B.volume,
    facture_B.date,
    undefined,
    facture_B.fuelType
);

console.log(`Facture A sans sector: ${calc_A_no_sector.toFixed(2)} CHF`);
console.log(`Facture B sans sector: ${calc_B_no_sector.toFixed(2)} CHF`);
console.log();

if (calc_A_no_sector === 340.60 && calc_B_no_sector === 340.60) {
    console.log('⚠️  HYPOTHÈSE CONFIRMÉE: Quand sector est undefined, les deux');
    console.log('   factures retournent 340.60 CHF (taux standard au lieu du taux agricole)');
    console.log();
    console.log('📋 CONCLUSION:');
    console.log('   Le bug vient probablement de machine.taxasActivity qui est undefined');
    console.log('   dans le contexte de génération CSV, forçant l\'utilisation du taux');
    console.log('   standard au lieu du taux agriculture avec paiements directs.');
} else {
    console.log('❓ L\'hypothèse n\'est pas validée, le problème est ailleurs.');
}

console.log();
console.log('='.repeat(70));
