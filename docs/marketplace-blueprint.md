# Marketplace Blueprint

Start with domain-driven modules: split src/app/(public|auth|provider|client) and keep feature logic in src/modules/`feature` (UI, actions, DAL, schemas, types) so teams can scale independently.

Treat Next.js App Router as the orchestration layer: route handlers for public APIs, server actions for authenticated workflows, middleware for auth/role gates, all backed by DAL functions in src/lib/dal.

Adopt a contract-first approach: define Valibot schemas + Drizzle models in src/lib/db and generate typed responses via src/types/api-responses.ts; all forms live under feature modules using React Hook Form + ShadCN UI.

Implement Stripe, Clerk, Twilio adapters behind service facades (e.g., src/lib/stripe, src/lib/clerk) so the rest of the app depends on typed interfaces, making it easy to swap providers or mock in tests.

Use background work queues (Vercel cron, Upstash QStash, or Neon functions) for heavy jobs like payouts, notifications, and analytics aggregation to keep server actions fast.
Ensure observability from day one: structured logging (pino), request tracing, and feature-level metrics so you can monitor growth hotspots and regressions.
Scalability Essentials

Data: normalize core entities (users, providers, gigs, bookings, payouts) in Neon; layer read models via cached queries (React cache() + Redis) for dashboards/search.

Search & discovery: integrate an external vector/text search (Algolia, Typesense) fed by Drizzle change streams to keep results fresh without overloading PostgreSQL.

Pricing & transactions: centralize all payment logic in Stripe Connect accounts, with deterministic webhooks processed through a queue to ensure idempotency.

Compliance: keep PII locked behind Clerk tokens, restrict server actions with middleware + auth guards, and implement audit logging for all marketplace-critical events.

Organizational Practices

Enforce feature RFCs before major additions, keep ADRs in /docs/decisions, and require integration tests for every server action touching money or availability.
Automate quality gates: lint, type-check, unit, integration, and Playwright smoke tests in CI; use preview deployments for product review and Vercel analytics for UX telemetry.
Next steps you might take:

Bootstrap a modules directory with one feature (e.g., onboarding) following this structure.
Set up Stripe Connect sandbox with deterministic test data and webhook forwarding.
Add a lightweight queue worker to handle asynchronous jobs before marketplace traffic grows.
