// Script de diagnostic pour vérifier le mapping Drizzle ORM
import { db } from './server/db';
import { machines, fuelEntries } from './shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

async function testMapping() {
    console.log('='.repeat(70));
    console.log('DIAGNOSTIC: Vérification du mapping Drizzle ORM');
    console.log('='.repeat(70));

    try {
        // Test 1: SELECT simple sur machines
        console.log('\n📋 Test 1: SELECT simple sur machines');
        const allMachines = await db.select().from(machines).limit(1);
        console.log('Premier élément retourné:');
        console.log(JSON.stringify(allMachines[0], null, 2));
        console.log('Clés de l\'objet:', Object.keys(allMachines[0] || {}));
        console.log('taxasActivity:', (allMachines[0] as any)?.taxasActivity);
        console.log('taxas_activity:', (allMachines[0] as any)?.taxas_activity);

        // Test 2: SELECT avec leftJoin
        console.log('\n📋 Test 2: SELECT avec leftJoin');
        const joined = await db
            .select()
            .from(fuelEntries)
            .leftJoin(machines, eq(fuelEntries.machineId, machines.id))
            .limit(1);

        console.log('Résultat du join:');
        console.log('fuel_entries:', JSON.stringify(joined[0]?.fuel_entries, null, 2));
        console.log('machines:', JSON.stringify(joined[0]?.machines, null, 2));
        console.log('machines.taxasActivity:', (joined[0]?.machines as any)?.taxasActivity);
        console.log('machines.taxas_activity:', (joined[0]?.machines as any)?.taxas_activity);

    } catch (error) {
        console.error('Erreur:', error);
    }

    process.exit(0);
}

testMapping();
