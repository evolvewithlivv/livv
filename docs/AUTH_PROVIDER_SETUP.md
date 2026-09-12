# LIVV authentication setup (Email OTP + Phone SMS only)

LIVV uses **only**:

1. **Email OTP** — 6-digit code via Supabase `signInWithOtp` / `verifyOtp({ type: "email" })`
2. **Phone SMS OTP** — 6-digit code via Supabase `signInWithOtp` / `verifyOtp({ type: "sms" })`

**Permanently out of scope:** Google, Apple, X/Twitter, Snapchat, Facebook, or any other social/OAuth identity provider.

---

## Hard requirement: Magic Link template must show `{{ .Token }}`

Official Supabase docs (Passwordless email / Email OTP):

> Email OTPs share an implementation with Magic Links. To send an OTP instead of a Magic Link, alter the **Magic Link** email template. Modify the template to include the `{{ .Token }}` variable.

There is **no** client API flag that forces a 6-digit email.  
`signInWithOtp({ email })` always uses the same Auth path; **email body content is controlled only by the dashboard template**.

| Template content | What the user receives | Can enter 6 digits in LIVV? |
|------------------|------------------------|-----------------------------|
| Only `{{ .ConfirmationURL }}` (default magic link) | A clickable link | **No** — no visible code |
| Includes `{{ .Token }}` | Visible 6-digit code | **Yes** — `verifyOtp({ type: "email" })` |

LIVV already calls:

```ts
await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
await supabase.auth.verifyOtp({ email, token: "123456", type: "email" })
```

That is the correct client path. It cannot invent a visible code if the template omits `{{ .Token }}`.

### Exact template to paste (Supabase Dashboard)

1. Open **Authentication → Email Templates**
2. Select **Magic link** (sometimes labeled **Magic link or OTP**)
3. Replace the body with something equivalent to:

```html
<h2>Your LIVV sign-in code</h2>
<p>Enter this 6-digit code in the LIVV app:</p>
<p style="font-size:24px;letter-spacing:4px;font-weight:bold;">{{ .Token }}</p>
<p>This code expires in about one hour. If you did not request it, ignore this email.</p>
```

You may keep a secondary link using `{{ .ConfirmationURL }}` if you want, but **`{{ .Token }}` must appear as visible text** for the in-app OTP flow.

4. Save the template.
5. Send a new code from LIVV (old emails still reflect the old template).

Also ensure:

- **Authentication → Providers → Email** is enabled
- **URL configuration** Site URL is your production origin
- Redirect allow-list includes `https://YOUR_DOMAIN/auth/callback` (legacy link only)

---

## Application code (GitHub)

| Piece | Role |
|-------|------|
| `src/lib/supabase/real-auth.ts` | `startEmailAuth` / `verifyEmailAuth` / phone OTP |
| `src/app/auth/page.tsx` | Email + phone UI, 6-digit entry |
| `src/app/auth/callback/page.tsx` | Legacy magic-link code exchange only |
| `src/lib/supabase/client.ts` | `createClient(URL, ANON_KEY)` — URL must be origin only |

Required **public** env (Vercel Production):

- `NEXT_PUBLIC_SUPABASE_URL` = `https://<project-ref>.supabase.co` (no `/rest/v1` or `/auth/v1` suffix)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon or publishable key (not a URL)
- `NEXT_PUBLIC_APP_URL` = production origin

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`

---

## Phone SMS OTP

1. **Authentication → Providers → Phone** enabled
2. SMS provider (Twilio, etc.) connected and funded
3. Numbers in E.164 (`+15551234567`)

---

## Launch checklist

### Code / Vercel

- [ ] URL and anon key correct (not swapped, URL has no path suffix)
- [ ] Production deployment Ready

### Supabase (required for visible email codes)

- [ ] Magic Link template includes **`{{ .Token }}` as visible text**
- [ ] Email provider enabled
- [ ] Custom SMTP recommended for production deliverability
- [ ] Phone + SMS provider if using phone

### User tests

- [ ] Request email code → **email shows 6 digits** → verify in app → home/onboarding
- [ ] Wrong code shows clear error
- [ ] Resend works after cooldown

---

## What code cannot fix

A green Vercel deploy does **not** put `{{ .Token }}` into the Supabase email template.  
Without that dashboard change, users receive a magic link only and cannot complete LIVV’s 6-digit entry path.
