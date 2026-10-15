-- Remove the retired EVALA product surface and its server-side rate limiter.
-- This migration intentionally drops only EVALA-specific runtime objects.

drop function if exists public.consume_evala_rate_limit(integer, integer);
drop function if exists private.consume_evala_rate_limit(integer, integer);
drop table if exists private.evala_rate_limits;
