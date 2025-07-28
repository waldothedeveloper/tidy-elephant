import * as schema from "./schema";

import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import { neon } from "@neondatabase/serverless";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, {
  schema,
  logger: env.NODE_ENV === "development",
});

export type Database = typeof db;
