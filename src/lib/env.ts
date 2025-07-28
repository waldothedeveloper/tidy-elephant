import { loadEnvConfig } from "@next/env";
import { z } from "zod";

loadEnvConfig(process.cwd());

const envSchema = z.object({
  DATABASE_URL: z.url(),
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
});

export const env = envSchema.parse(process.env);

if (typeof window === "undefined") {
  envSchema.parse(process.env);
}
