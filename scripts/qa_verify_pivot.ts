import { calculateReimbursementBySectorAndDate, getApplicableRate } from '../shared/schema';

console.log("=== QA Verification: V1.1 Date Pivot Logic ===\n");

const tests = [
    {
        name: "Scenario 1A: Pre-2026 Agriculture Diesel",
        input: {
            volume: 1000,
            date: new Date('2025-12-15T00:00:00.000Z'),
            sector: 'agriculture_with_direct',
            fuel: 'diesel'
        },
        expected: {
            rate: 0.3406,
            amount: 340.60
        }
    },
    {
        name: "Scenario 1B: Post-2026 Agriculture Diesel",
        input: {
            volume: 1000,
            date: new Date('2026-01-05T00:00:00.000Z'),
            sector: 'agriculture_with_direct',
            fuel: 'diesel'
        },
        expected: {
            rate: 0.6005,
            amount: 600.50
        }
    },
    {
        name: "Scenario 2: Post-2026 Construction Diesel (Control)",
        input: {
            volume: 1000,
            date: new Date('2026-01-05T00:00:00.000Z'),
            sector: 'construction',
            fuel: 'diesel'
        },
        expected: {
            rate: 0.3406,
            amount: 340.60
        }
    }
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
    console.log(`Testing: ${test.name}`);
    const rate = getApplicableRate(test.input.date, test.input.sector, test.input.fuel);
    const amount = calculateReimbursementBySectorAndDate(
        test.input.volume,
        test.input.date,
        test.input.sector,
        test.input.fuel
    );

    const rateMatch = Math.abs(rate - test.expected.rate) < 0.0001;
    const amountMatch = Math.abs(amount - test.expected.amount) < 0.01;

    if (rateMatch && amountMatch) {
        console.log(`✅ PASS`);
        console.log(`   Rate: ${rate} (Expected: ${test.expected.rate})`);
        console.log(`   Amount: ${amount} (Expected: ${test.expected.amount})`);
        passed++;
    } else {
        console.log(`❌ FAIL`);
        if (!rateMatch) console.log(`   Rate: ${rate} (Expected: ${test.expected.rate})`);
        if (!amountMatch) console.log(`   Amount: ${amount} (Expected: ${test.expected.amount})`);
        failed++;
    }
    console.log("-----------------------------------");
});

console.log(`\nSummary: ${passed} Passed, ${failed} Failed`);

if (failed > 0) process.exit(1);
process.exit(0);
