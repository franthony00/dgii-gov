import { Pool } from "pg";

if (!process.env.POSTGRES_URL) {
  throw new Error("❌ Missing POSTGRES_URL in environment variables");
}

export const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});
