import { db } from "../server/db";
import { users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function createTestUser() {
    const username = "testuser";
    const password = "password123";
    const email = "test@mineraltax.ch"; // Optional

    console.log(`Creating test user: ${username} / ${password}`);

    const hashedPassword = await hashPassword(password);

    try {
        const [user] = await db.insert(users).values({
            username,
            password: hashedPassword,
            email,
            firstName: "Test",
            lastName: "User",
            companyName: "Test Company Ltd",
        }).returning();

        console.log("✅ User created successfully!");
        console.log(`ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error("Error creating user:", error);
    }
    process.exit(0);
}

createTestUser();
