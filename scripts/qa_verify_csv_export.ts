import { generateTaxasCsv } from '../server/routes';
import { type Machine, type FuelEntry } from '../shared/schema';
import fs from 'fs';

console.log("=== QA Verification: CSV Availability & Compliance ===\n");

// 1. Mock Data
const mockMachine: Machine = {
    id: 'machine-1',
    userId: 'user-1',
    name: 'Tractor A',
    type: 'dumper', // Changed from 'tractor' to a valid enum value 'dumper' as 'tractor' is not in machineTypeEnum
    customType: null,
    taxasActivity: 'agriculture_with_direct',
    licensePlate: 'VS 123456',
    plateColor: 'green',
    chassisNumber: 'VIN-123456789',
    registrationNumber: 'MAT-987654', // N° Matricule
    rcNumber: 'RC-555',
    year: 2020,
    power: '100kw',
    isEligible: true,
    createdAt: new Date(),
    updatedAt: new Date()
};

const entry2025: FuelEntry & { machine?: Machine } = {
    id: 'entry-1',
    userId: 'user-1',
    machineId: mockMachine.id,
    invoiceDate: new Date('2025-12-15T12:00:00Z'),
    invoiceNumber: 'INV-2025',
    volumeLiters: 1000,
    engineHours: 100,
    fuelType: 'diesel',
    articleNumber: 'ART-001',
    warehouseNumber: 'WH-01',
    movementNumber: 'MOV-001',
    bd: '',
    stat: '',
    ci: '',
    notes: '',
    createdAt: new Date(),
    machine: mockMachine
};

const entry2026: FuelEntry & { machine?: Machine } = {
    ...entry2025,
    id: 'entry-2',
    invoiceDate: new Date('2026-01-05T12:00:00Z'),
    invoiceNumber: 'INV-2026',
    // Using same machine instance to ensure properties are available
    machine: mockMachine
};

const mockCompanyProfile = {
    rcNumber: 'RC-COMPANY-001'
};

const mockReport = {
    language: 'fr'
};

// 2. Generate CSV
const csvOutput = generateTaxasCsv(
    mockReport,
    [mockMachine],
    [entry2025, entry2026],
    mockCompanyProfile
);

// Save to file for manual inspection
fs.writeFileSync('verified_export.csv', csvOutput);
console.log("✅ CSV saved to 'verified_export.csv'");

console.log("CSV Output Generated (Preview first 5 lines):");
const csvLines = csvOutput.split('\n');
csvLines.slice(0, 5).forEach(line => console.log(line));
console.log("...\n");

// 3. Verifications
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${message}`);
        failed++;
    }
}

console.log("--- Checking Structure ---");
// Header check
const header = csvLines[0];
assert(header.includes('N° matricule'), 'Header contains "N° matricule"');
assert(header.includes('N° châssis'), 'Header contains "N° châssis"');

console.log("\n--- Checking Metadata ---");
// Footer check
const footerLegal = csvLines.find(line => line.includes("Source légale : Règlement 09 de l'OFDF"));
assert(!!footerLegal, 'Footer contains OFDF regulation reference');
const footerTaxas = csvLines.find(line => line.includes("Compatible avec la plateforme Taxas"));
assert(!!footerTaxas, 'Footer contains Taxas compatibility mention');

console.log("\n--- Checking Calculations (Scenarios) ---");

// Helper to parse CSV line
function parseCsvLine(line: string) {
    const parts = line.split(';');
    // RC;N° matricule;N° châssis;N° article;N° entrepôt;Date mouvement;N° mouvement;Quantité de litres;...;Montant
    // Index 11 is Amount (0-indexed)
    return {
        date: parts[5],
        amount: parseFloat(parts[11])
    };
}

// Find 2025 line
const line2025 = csvLines.find(l => l.includes('15.12.2025'));
if (line2025) {
    const data = parseCsvLine(line2025);
    // Expected: 1000L * 0.3406 = 340.60
    const expected = 340.60;
    assert(Math.abs(data.amount - expected) < 0.01, `2025 Row Amount is correct (${data.amount} vs ${expected})`);
} else {
    console.log('❌ FAIL: Could not find 2025 row');
    failed++;
}

// Find 2026 line
const line2026 = csvLines.find(l => l.includes('05.01.2026'));
if (line2026) {
    const data = parseCsvLine(line2026);
    // Expected: 1000L * 0.6005 = 600.50
    const expected = 600.50;
    assert(Math.abs(data.amount - expected) < 0.01, `2026 Row Amount is correct (${data.amount} vs ${expected})`);
} else {
    console.log('❌ FAIL: Could not find 2026 row');
    failed++;
}

console.log(`\nSummary: ${passed} Passed, ${failed} Failed`);

if (failed > 0) process.exit(1);
process.exit(0);
