# LIVV authentication provider setup

LIVV's production sign-in surface has five real methods:

1. Google OAuth
2. Apple OAuth
3. X (Twitter) OAuth 2.0
4. Email magic-link authentication
5. Phone SMS OTP

The app uses Supabase Auth. The browser never receives provider client secrets.

## Supabase callback URLs

Provider OAuth callbacks terminate at Supabase:

`https://jnrfzmnxpdcqjmyrgyav.supabase.co/auth/v1/callback`

After Supabase completes the provider flow, LIVV receives the authenticated session at:

`https://<LIVV-production-domain>/auth/callback`

For local development, use the local LIVV origin for the app redirect, while the provider's Supabase callback remains the Supabase callback URL.

## Google

- Create a Google OAuth Web application.
- Add the LIVV production origin to Authorized JavaScript origins.
- Configure the Supabase Google provider with the Google Client ID and Client Secret.
- Add the Supabase callback URL above to Google's authorized redirect URIs where required.

## Apple

- Create/configure the Apple App ID and Services ID for web authentication.
- Configure the web return URL to the Supabase callback URL above.
- Add the Services ID/client ID and generated Apple secret to Supabase.
- Keep the production LIVV redirect in Supabase's redirect allow list.

## X / Twitter

- Use X OAuth 2.0.
- Create the X project/app and obtain the Client ID and Client Secret.
- Set the X callback/redirect URL to the Supabase callback URL above.
- Enable X in Supabase Auth with those credentials.

Supabase recommends the X OAuth 2.0 provider rather than the legacy Twitter OAuth 1.0a provider.

## Email

LIVV uses Supabase passwordless email authentication from `/auth`.

- Configure Supabase email provider settings and SMTP for production.
- Ensure the production `/auth/callback` URL is in the Supabase redirect allow list.
- The app creates/continues the Supabase identity through the real Auth API; it does not use the legacy local fake-auth path for this flow.

## Phone

LIVV uses Supabase SMS OTP.

- Enable the phone provider in Supabase Auth.
- Configure a supported SMS provider (for example Twilio, Vonage, or MessageBird).
- Test the production number verification flow and rate limits before launch.

## Anonymous identity and linking

LIVV creates an anonymous Supabase user so a visitor can use the product before choosing a permanent sign-in method. Google, Apple, and X use `linkIdentity()` when an anonymous session exists; email and phone use `updateUser()`/OTP to upgrade the same `auth.users.id`.

This identity continuity is important because B1 entitlements are keyed by `auth.users.id`.

## Launch checklist

- [ ] Google provider enabled and tested
- [ ] Apple provider enabled and tested
- [ ] X provider enabled and tested
- [ ] Email provider + production SMTP tested
- [ ] Phone provider + SMS delivery tested
- [ ] Supabase redirect allow list contains production `/auth/callback`
- [ ] Supabase manual identity linking is enabled if required by the project's OAuth linking policy
- [ ] Production Vercel environment contains `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Production Vercel environment contains `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Production Vercel environment contains server-only `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Test sign-out after every provider and confirm the next visitor does not inherit the prior cloud session
