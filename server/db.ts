import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: isProduction ? 10 : 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false,
});

pool.on("error", (err) => {
  console.error("[Database] Pool error:", err.message);
});

pool.on("connect", () => {
  console.log("[Database] New client connected to pool");
});

async function testConnection(retries = 5, delay = 2000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      console.log("[Database] Connection successful");
      return true;
    } catch (error: any) {
      console.log(`[Database] Connection attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error("[Database] All connection attempts failed");
  return false;
}

testConnection().catch(console.error);

export const db = drizzle(pool, { schema });
