# LIVV · App Store & Google Play readiness

LIVV is a production-grade Next.js 15 + Supabase + Stripe PWA that is also packaged as a native shell via Capacitor for App Store / Play Store distribution.

## Architecture decision

**Live-server Capacitor shell** (recommended for this product):

- The native container loads `https://evolvewithlivv.com` (or a preview URL).
- All App Router pages, `/api/*` routes, Stripe webhooks/checkout, Supabase Auth OTP, server entitlements, remain fully functional.
- No static export, no loss of SSR/edge features, no dual codepaths for billing or auth.
- Updates ship by deploying to Vercel; users get the new web surface on next app open (or via forced reload).

Static export is intentionally **not** used because it would break authenticated API routes and Stripe ownership checks.

## Prerequisites

1. Production site is live and healthy (`GET /api/health` returns the expected commit).
2. Apple Developer account + App Store Connect app created.
3. Google Play Console app created (if shipping Android).
4. macOS + Xcode for iOS builds; Android Studio for Android.
5. Capacitor dependencies installed (see below).

## One-time setup

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/splash-screen @capacitor/status-bar
npx cap init   # already done; config lives in capacitor.config.ts
npx cap add ios
npx cap add android
npx cap sync
```

Update `capacitor.config.ts` → `server.url` if the production domain changes.

## Build & open native projects

```bash
# After any web deploy or config change
npx cap sync
npx cap open ios      # opens Xcode
npx cap open android  # opens Android Studio
```

In Xcode:

- Set Team / Signing & Capabilities (Automatic).
- Bundle ID must match `com.evolvewithlivv.livv` (or the one registered in App Store Connect).
- Add Privacy – Camera Usage Description only if you later enable camera features (currently none).
- Archive → Distribute App → App Store Connect.

## App Store Connect checklist

- [ ] App name: LIVV
- [ ] Subtitle / promotional text describing the six pillars + daily evolution loop
- [ ] Screenshots for 6.7", 6.5", 5.5" (iPhone) and iPad if supporting
- [ ] Privacy Policy URL: https://evolvewithlivv.com/legal/privacy (or the in-app route)
- [ ] Terms of Use URL: https://evolvewithlivv.com/legal/terms
- [ ] Support URL / email: evolvewithlivv@gmail.com
- [ ] Age rating: 12+ (self-improvement, no unrestricted web, no user-generated mature content in V1)
- [ ] App Privacy: declare data collected (email for auth, purchase history via Stripe, device identifiers if any analytics added later)
- [ ] In-App Purchases: map Stripe products or use Apple IAP if required for digital goods in the future (current billing is web Stripe; confirm App Store guidelines for external payment links)
- [ ] Export compliance: standard encryption (HTTPS only)

## Google Play notes

- Use the same live URL.
- Complete Data safety form (email, purchase history).
- Content rating questionnaire.
- Target API level per current Play requirements.

## Shipping gates (still apply)

See `docs/SHIP_READINESS.md` and `docs/SHIP_SMOKE_TEST.md`.

Especially:

1. Email OTP delivers in production.
2. Onboarding never creates a permanent local session without a verified Supabase user.
3. Member progress is cloud-backed.
4. Stripe webhooks + entitlements work end-to-end.
5. Production demo-unlock flag is ignored.

## Useful repositories & references

- Capacitor docs: https://capacitorjs.com/docs
- Next.js + Capacitor live-server pattern (recommended for apps with API routes)
- Official Capacitor Splash Screen & Status Bar plugins
- Apple Human Interface Guidelines – navigation, safe areas (LIVV already uses `env(safe-area-inset-*)` and `100dvh`)

## Next product steps after store submission

- Optional: Capacitor Preferences / Secure Storage for additional offline resilience.
- Optional: Push notifications via Capacitor Push Notifications + a server provider.
- Optional: Apple Sign-In only if product requirements change (currently email-only by design).
