# LIVV ship readiness

Current pre-launch blockers identified in the September 2026 audit:

- Production email OTP delivery must return success and deliver the 8-digit code.
- Onboarding must not mint a local member session without a verified Supabase Auth user.
- Core member progress must remain cloud-backed for the promised cross-device account experience.

These are release gates, not optional polish.

## App Store / Play Store additional gates

- [ ] Capacitor config points at the correct production URL (`capacitor.config.ts`).
- [ ] `npx cap sync` succeeds and native projects open cleanly in Xcode / Android Studio.
- [ ] App icons and splash assets are present and match brand (dark `#030405` background).
- [ ] Privacy Policy + Terms of Use are reachable from the store listing and inside the app.
- [ ] Age rating questionnaire completed (recommended 12+).
- [ ] App Privacy / Data safety forms accurately list email (auth) and purchase data (Stripe).
- [ ] TestFlight / internal testing build launches, signs in via email OTP, and completes a paid test checkout.
- [ ] No phone/SMS or third-party social login controls are exposed.
- [ ] Safe-area and bottom-nav spacing remain correct in the native WebView.

See `docs/APP_STORE.md` for the full submission playbook.
