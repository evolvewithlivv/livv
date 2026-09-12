# LIVV authentication setup (Email OTP only)

LIVV uses **one authentication method: email**.

- **Email OTP** — an 8-digit code delivered by email through Supabase Auth.
- Sign up and sign in use the same passwordless flow.
- Email changes are handled through verified email authentication.

Phone/SMS authentication and social/OAuth identity providers are not part of LIVV V1.

---

## Email OTP template

Supabase Email OTP and Magic Link use the same Auth email template. The template must include `{{ .Token }}` as visible text so the member can enter the numeric code in LIVV.

LIVV calls:

```ts
await supabase.auth.signInWithOtp({
  email,
  options: { shouldCreateUser: true },
})

await supabase.auth.verifyOtp({
  email,
  token: "12345678",
  type: "email",
})
```

### Supabase dashboard

1. Open **Authentication → Email Templates**.
2. Select **Magic link** (or **Magic link or OTP**, depending on dashboard wording).
3. Make the email show `{{ .Token }}` as the sign-in code.
4. Save the template.
5. Request a new code from LIVV when testing. Existing emails use the template that was active when they were sent.

The exact visual design can be customized in Supabase or through the configured email provider. The important requirement for LIVV is that `{{ .Token }}` is visible in the email body.

Also ensure:

- **Authentication → Providers → Email** is enabled.
- Production Site URL is correct.
- Production redirect configuration is correct for `/auth/callback` if the confirmation link is retained.
- Production email delivery is configured and tested.

---

## Application code

| Piece | Role |
|---|---|
| `src/lib/supabase/real-auth.ts` | Email OTP send, verification, session materialization |
| `src/app/auth/page.tsx` | Email entry + 8-digit code UI |
| `src/app/auth/callback/page.tsx` | Legacy email confirmation-link exchange |
| `src/lib/supabase/client.ts` | Supabase browser client |
| `src/lib/auth.ts` | Local product account/session model; provider is email-only |

Required public env in Vercel Production:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://<project-ref>.supabase.co` (origin only)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key, not a URL
- `NEXT_PUBLIC_APP_URL` = production origin

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`

Never put server secrets in a `NEXT_PUBLIC_*` variable.

---

## Launch checklist

### Code / Vercel

- [ ] Production deployment is Ready.
- [ ] Supabase URL is the bare project origin.
- [ ] Public client key is the anon/public key.
- [ ] No phone/SMS authentication path remains.
- [ ] No social/OAuth sign-in path remains.

### Supabase

- [ ] Email provider enabled.
- [ ] Email template visibly includes `{{ .Token }}`.
- [ ] Production email delivery works.
- [ ] Production redirect URL is correct if confirmation links are retained.

### User tests

- [ ] Fresh email → request code → receive 8-digit code → verify → onboarding/home.
- [ ] Existing email → request code → verify → same account.
- [ ] Wrong code shows a clear error.
- [ ] Resend works.
- [ ] Change email flow requires verification.
- [ ] Sign out → sign back in with email.

---

## Product rule

LIVV V1 authentication is intentionally simple: **email only**. Do not reintroduce phone numbers, SMS authentication, Apple, Google, X/Twitter, Snapchat, or another identity provider without an explicit product decision and a new authentication architecture review.
