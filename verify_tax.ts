
import { calculateReimbursementBySectorAndDate, ROUNDING_ERROR_TOLERANCE } from "./shared/schema";

// Mock environment not needed as schema is pure logic usually, but let's see imports.
// schema imports drizzle, but the calc function is pure.

const testCases = [
    {
        name: "Agri Diesel Pre-2026",
        input: { vol: 100, date: new Date("2025-12-31"), sector: "agriculture_with_direct", fuel: "diesel" },
        expected: 34.06
    },
    {
        name: "Agri Diesel Post-2026",
        input: { vol: 100, date: new Date("2026-01-01"), sector: "agriculture_with_direct", fuel: "diesel" },
        expected: 60.05
    },
    {
        name: "Agri Gasoline Pre-2026",
        input: { vol: 100, date: new Date("2025-12-31"), sector: "agriculture_with_direct", fuel: "gasoline" },
        expected: 33.50
    },
    {
        name: "Agri Gasoline Post-2026",
        input: { vol: 100, date: new Date("2026-01-01"), sector: "agriculture_with_direct", fuel: "gasoline" },
        expected: 59.24
    },
    {
        name: "Agri Diesel Post-2026 (No Direct Payment)",
        input: { vol: 100, date: new Date("2026-01-01"), sector: "agriculture_without_direct", fuel: "diesel" },
        expected: 34.06 // Should be standard rate
    },
    {
        name: "Construction Diesel Post-2026",
        input: { vol: 100, date: new Date("2026-01-01"), sector: "construction", fuel: "diesel" },
        expected: 34.06
    }
];

let failed = false;

console.log("Running Tax Logic Verification...");

testCases.forEach(test => {
    const result = calculateReimbursementBySectorAndDate(
        test.input.vol,
        test.input.date,
        test.input.sector,
        test.input.fuel
    );

    if (Math.abs(result - test.expected) > 0.01) {
        console.error(`[FAIL] ${test.name}: Expected ${test.expected}, got ${result}`);
        failed = true;
    } else {
        console.log(`[PASS] ${test.name}: ${result}`);
    }
});

if (failed) {
    process.exit(1);
} else {
    console.log("All tests passed!");
}
