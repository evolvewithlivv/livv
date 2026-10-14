# Crew foundation implementation notes

This branch introduces the initial shared-data schema and typed domain model. It intentionally does not change production or apply migrations.

## Trust model
- Browser requests authenticate through `getVerifiedSupabaseUser`; never trust a client-supplied user ID.
- Privileged mutations use `getSupabaseAdmin` only after authentication and server-side validation.
- Authenticated clients receive SELECT access governed by RLS; invitation tokens and audit rows remain server-only.
- Crew challenge totals are derived from eligible `crew_completions` rows. Never store client-submitted score totals.

## Migration
Apply `supabase/migrations/20261014090000_crew_foundation.sql` only after reviewing it against the live schema and running it in a non-production Supabase environment first.

## Challenge trust levels
- `server_verified`: an independently validated server event.
- `app_recorded`: an existing LIVV event validated by the server but originating from the app.
- `self_reported`: explicitly self-reported; must never be presented as independently verified.

The schema is the foundation, not a claim that any real-world activity is cheat-proof. The event submission service must enforce challenge membership, dates, allowed activity keys, rate limits, idempotency, and scoring rules.
