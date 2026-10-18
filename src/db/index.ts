import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { config } from "../config";
import * as schema from "./schema";

const connectionString = config.postgresUrl || process.env.POSTGRES_URL || "";

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });

export async function runMigrations() {
  if (!connectionString) {
    throw new Error("POSTGRES_URL is not defined");
  }
  await migrate(db, { migrationsFolder: "./drizzle" });
}

export * from "./schema";
