import { Pool } from "pg";

const connectionString = process.env.NEON_URL;

if (!connectionString) {
  throw new Error("❌ Missing NEON_URL in environment variables");
}

export const db = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
