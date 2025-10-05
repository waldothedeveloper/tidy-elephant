import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user-schema";

export const providerOnboardingStepEnum = pgEnum("provider_onboarding_step", [
  "Build Profile",
  "Trust & Safety",
  "Onboarding Fee",
]);

export const providerOnboardingStatusEnum = pgEnum(
  "provider_onboarding_status",
  ["complete", "current", "upcoming"]
);

export const providerOnboardingFlowTable = pgTable(
  "provider_onboarding_flow",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    stepName: providerOnboardingStepEnum("step_name").notNull(),
    stepDescription: text("step_description").notNull(),
    status: providerOnboardingStatusEnum("status")
      .notNull()
      .default("upcoming"),
    sortOrder: integer("sort_order").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("provider_onboarding_flow_user_step_uq").on(
      table.userId,
      table.stepName
    ),
    index("provider_onboarding_flow_user_idx").on(table.userId),
  ]
);
