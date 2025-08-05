import * as addressSchema from "./address-schema";
import * as bookingSchema from "./booking-schema";
import * as categorySchema from "./category-schema";
import * as clientSchema from "./client-schema";
import * as paymentSchema from "./payment-schema";
import * as providerSchema from "./provider-schema";
import * as reviewSchema from "./review-schema";
import * as userSchema from "./user-schema";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const schema = {
  ...userSchema,
  ...providerSchema,
  ...clientSchema,
  ...categorySchema,
  ...bookingSchema,
  ...reviewSchema,
  ...paymentSchema,
  ...addressSchema,
};

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export type Database = typeof db;
