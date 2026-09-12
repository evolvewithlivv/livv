# LIVV authentication setup

LIVV intentionally keeps account access simple and does not use social/OAuth providers as identity providers.

The production sign-in surface has exactly two methods:

1. Email magic-link authentication
2. Phone SMS OTP authentication

Google, Apple, X/Twitter, Snapchat, and other social/OAuth providers are not used for LIVV sign-in or sign-up.

## Supabase

LIVV uses Supabase Auth for real account creation and sign-in. The browser never receives server secrets.

The application may use an anonymous Supabase identity before a member chooses a permanent authentication method. Email and phone upgrade that same `auth.users.id`, preserving identity continuity for billing and entitlements.

## Email

LIVV uses passwordless email authentication from `/auth`.

- Enable the Supabase email provider.
- Configure production email delivery/SMTP.
- Keep the production LIVV `/auth/callback` URL in the Supabase redirect allow list.
- Test both a new email address and an existing account.
- Verify that the callback returns the member to `/home` with the same LIVV identity.

## Phone

LIVV uses Supabase SMS OTP.

- Enable the phone provider in Supabase Auth.
- Configure a supported SMS provider.
- Test new-number account creation and returning-member sign-in.
- Verify OTP rate limits and error handling before launch.

## Callback

Email magic links return through the LIVV callback route:

`https://<LIVV-production-domain>/auth/callback`

The callback exchanges the Supabase authorization code for a session and materializes the authenticated user into the existing LIVV product session.

No OAuth provider callback is required by the LIVV application.

## Account continuity

Email and phone are the only permanent authentication methods exposed by LIVV. When an anonymous session is upgraded, the app uses Supabase Auth account updates rather than creating a second identity, preserving the same `auth.users.id` used by server entitlements.

## Social sharing is separate from authentication

LIVV may eventually generate share cards that members can save to their device photo library and post to Instagram, X/Twitter, TikTok, Snapchat, Facebook, or other platforms.

Those platforms are distribution channels, not LIVV identity providers. A person who discovers a LIVV share card should come back to LIVV and create/access their account with email or phone.

## Launch checklist

- [ ] Email magic-link provider enabled and tested
- [ ] Phone SMS OTP provider enabled and tested
- [ ] Production `/auth/callback` redirect is allowed
- [ ] New email creates a LIVV account
- [ ] Existing email can sign back in
- [ ] New phone number creates a LIVV account
- [ ] Existing phone number can sign back in
- [ ] Sign-out clears the local Supabase session
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is configured in Production
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is configured in Production
- [ ] Server-only `SUPABASE_SERVICE_ROLE_KEY` is configured in Production
