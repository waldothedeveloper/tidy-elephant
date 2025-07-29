import * as addressSchema from "./address-schema";
import * as bookingSchema from "./booking-schema";
import * as clientSchema from "./client-schema";
import * as indexes from "./indexes";
import * as paymentSchema from "./payment-schema";
import * as providerSchema from "./provider-schema";
import * as reviewSchema from "./review-schema";
import * as userSchema from "./user-schema";

import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import { neon } from "@neondatabase/serverless";

const schema = {
  ...userSchema,
  ...providerSchema,
  ...clientSchema,
  ...bookingSchema,
  ...reviewSchema,
  ...paymentSchema,
  ...addressSchema,
  ...indexes,
};


const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, {
  schema,
  logger: env.NODE_ENV === "development",
});

export type Database = typeof db;
