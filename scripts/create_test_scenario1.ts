import { db } from "../server/db";
import { machines, fuelEntries, users } from "../shared/schema";

async function createTestData() {
    console.log("🔍 Looking for any user...");

    // Get first available user
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users`);

    if (allUsers.length === 0) {
        console.error("❌ No users found in database.");
        process.exit(1);
    }

    const testUser = allUsers[0]; // Use the first user
    const userId = testUser.id;
    console.log(`✅ Using user: ${testUser.username} (${userId})`);

    // Check if test machine exists
    const allMachines = await db.select().from(machines);
    let testMachine = allMachines.find(m => m.userId === userId && m.name === "Test Tractor QA");

    if (!testMachine) {
        console.log("🚜 Creating test machine...");
        [testMachine] = await db.insert(machines).values({
            userId,
            name: "Test Tractor QA",
            type: "dumper",
            taxasActivity: "agriculture_with_direct", // CRITICAL: This triggers the 60.05 rate
            licensePlate: "VS 12345",
            plateColor: "green",
            chassisNumber: "VIN-TEST-123",
            registrationNumber: "MAT-TEST-001",
            isEligible: true,
        }).returning();
        console.log(`✅ Machine created: ${testMachine.id}`);
    } else {
        console.log(`✅ Machine already exists: ${testMachine.id}`);
    }

    // Create Facture A (2025)
    console.log("📄 Creating Facture A (2025)...");
    const [entryA] = await db.insert(fuelEntries).values({
        userId,
        machineId: testMachine.id,
        invoiceDate: new Date('2025-12-15T12:00:00Z'),
        invoiceNumber: 'TEST-2025-SCENARIO1',
        volumeLiters: 1000,
        fuelType: 'diesel',
    }).returning();
    console.log(`✅ Facture A created: ${entryA.id}`);

    // Create Facture B (2026)
    console.log("📄 Creating Facture B (2026)...");
    const [entryB] = await db.insert(fuelEntries).values({
        userId,
        machineId: testMachine.id,
        invoiceDate: new Date('2026-01-05T12:00:00Z'),
        invoiceNumber: 'TEST-2026-SCENARIO1',
        volumeLiters: 1000,
        fuelType: 'diesel',
    }).returning();
    console.log(`✅ Facture B created: ${entryB.id}`);

    // Verify calculations
    const { calculateReimbursementBySectorAndDate } = await import("../shared/schema");

    const amountA = calculateReimbursementBySectorAndDate(
        1000,
        new Date('2025-12-15T12:00:00Z'),
        testMachine.taxasActivity,
        'diesel'
    );

    const amountB = calculateReimbursementBySectorAndDate(
        1000,
        new Date('2026-01-05T12:00:00Z'),
        testMachine.taxasActivity,
        'diesel'
    );

    console.log("\n📊 Verification:");
    console.log(`Facture A (2025): ${amountA.toFixed(2)} CHF (Expected: 340.60 CHF)`);
    console.log(`Facture B (2026): ${amountB.toFixed(2)} CHF (Expected: 600.50 CHF)`);

    if (Math.abs(amountA - 340.60) < 0.01 && Math.abs(amountB - 600.50) < 0.01) {
        console.log("\n✅ SUCCESS: Test data created and calculations verified!");
        console.log(`\n👉 Login with: ${testUser.username} to see the results!`);
    } else {
        console.log("\n❌ WARNING: Calculations don't match expected values!");
    }

    process.exit(0);
}

createTestData();
