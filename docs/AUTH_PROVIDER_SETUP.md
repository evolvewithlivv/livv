# LIVV authentication setup (Email OTP + Phone SMS only)

LIVV uses **only**:

1. **Email OTP** — 6-digit code via Supabase `signInWithOtp` / `verifyOtp({ type: "email" })`
2. **Phone SMS OTP** — 6-digit code via Supabase `signInWithOtp` / `verifyOtp({ type: "sms" })`

**Permanently out of scope:** Google, Apple, X/Twitter, Snapchat, Facebook, or any other social/OAuth identity provider.

Share cards may still be *posted* to social platforms by the user; those platforms are never LIVV login providers.

---

## Application code (GitHub)

| Piece | Role |
|-------|------|
| `src/lib/supabase/real-auth.ts` | `startEmailAuth` / `verifyEmailAuth` / `startPhoneAuth` / `verifyPhoneAuth` |
| `src/app/auth/page.tsx` | Email + phone UI, 6-digit entry, resend |
| `src/app/auth/callback/page.tsx` | Legacy magic-link code exchange only |
| `src/lib/supabase/client.ts` | Browser client; `detectSessionInUrl: false` |

Required **public** env (Vercel Production):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (production site origin)

Server-only (billing, not OTP delivery):

- `SUPABASE_SERVICE_ROLE_KEY`

---

## Supabase dashboard (required for delivery)

### Email OTP

1. **Authentication → Providers → Email** — enabled.
2. **Authentication → Email Templates** — Magic Link / OTP template body **must include** `{{ .Token }}` so the user receives a **6-digit code** (LIVV does not rely on clicking a link as the primary path).
3. Optional but recommended for production: **Project Settings → Authentication → SMTP** — custom SMTP (Resend, Postmark, SES, etc.). Built-in Supabase mail is rate-limited and often delayed or dropped.
4. **Authentication → URL Configuration** — Site URL = production origin; Redirect URLs include:
   - `https://YOUR_DOMAIN/auth/callback`
   - `https://YOUR_DOMAIN/**` (as needed)

### Phone SMS OTP

1. **Authentication → Providers → Phone** — enabled.
2. Configure an **SMS provider** (Twilio, MessageBird, Vonage, etc.) with valid credentials.
3. Test with a real handset; test numbers only work if configured as such.

Without these, the app can call Supabase correctly and still show success-path UI while **no message is delivered** — that is configuration, not a green Vercel build.

---

## Launch checklist

### Code / Vercel

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Production
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Production
- [ ] Production deployment Ready after auth changes

### Supabase

- [ ] Email provider enabled
- [ ] Email template includes `{{ .Token }}` (6-digit OTP)
- [ ] Production SMTP configured (recommended)
- [ ] Phone provider enabled
- [ ] SMS provider connected and funded
- [ ] Redirect URLs include `/auth/callback`

### User tests

- [ ] Request email code → code arrives → verify → session + onboarding/home
- [ ] Request SMS code → code arrives → verify → session + onboarding/home
- [ ] Wrong code shows clear error
- [ ] Resend works after cooldown
- [ ] Sign-out clears session

---

## What a green Vercel deploy does *not* prove

A successful Next.js build only proves the client ships. It does **not** prove:

- Supabase can send email
- SMTP is not rate-limited
- SMS provider is enabled
- Templates include `{{ .Token }}`
