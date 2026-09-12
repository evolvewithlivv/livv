# LIVV V1 — First-User Shipping Smoke Test

Run this on the current Production deployment after each release candidate. This is a manual product test, not a substitute for Stripe/Supabase dashboard verification.

## 0. Clean first-user state

- Use a fresh browser/private window or clear LIVV site storage.
- Open the production URL.
- Confirm the opening screen renders without a blank flash or console-visible error.

## 1. Opening + onboarding

- Tap **Enter LIVV**.
- Complete onboarding with realistic values.
- Confirm the user lands in Home.
- Refresh the page. Confirm identity/progression survives.
- Navigate Home → Daily → Train → Mind → Evala → Connect → Profile → Settings → Shop/Packs.
- Confirm every primary route loads and the bottom navigation remains usable on a phone-sized viewport.

## 2. Anonymous identity

- In Settings/Profile, confirm the account can exist without requiring an email or phone before the member chooses a permanent sign-in method.
- Refresh and navigate between pages.
- Confirm the same local identity remains present.
- Do not create a second identity accidentally by refreshing during bootstrap.

## 2.5. Permanent authentication — exactly two methods

### Email

- From `/auth`, confirm the only permanent choices shown are **Continue with email** and **Continue with phone**.
- Confirm there are no Google, Apple, X/Twitter, Snapchat, or other social/OAuth sign-in buttons.
- Enter a fresh test email.
- Confirm a secure LIVV email is delivered.
- Follow the email link and confirm the session returns to `/home`.
- Refresh and confirm the same account remains signed in.
- Sign out and repeat with the same email to confirm it can sign back in.

### Phone

- Sign out and return to `/auth`.
- Enter a test phone number in international format.
- Confirm a 6-digit SMS code is delivered.
- Enter the code and confirm the session returns to `/home`.
- Refresh and confirm the same account remains signed in.
- Sign out and repeat with the same number to confirm it can sign back in.

### Social-login absence

- Confirm LIVV never redirects to Google, Apple, X/Twitter, Snapchat, or another social identity provider.
- Social platforms are sharing destinations only, not LIVV identity providers.

## 3. Daily / Train / progression

- Complete one Daily action/check-in.
- Complete one Train session and verify it records.
- Confirm streak/level/Ember changes appear where expected.
- Leave and return to the page; confirm the completed state persists.

## 4. Evala

- Ask a short question.
- Confirm a response arrives or the deterministic fallback appears if the model service is unavailable.
- Confirm loading/error states recover without a stuck screen.
- Confirm the request does not expose secrets in the browser response.

## 5. Settings + data safety

- Toggle sound/haptics and appearance.
- Test an allowed accent color on the appropriate tier.
- Open the email-linking flow but do not complete it unless desired.
- Export LIVV data.
- Confirm an export file is produced.
- If using a disposable test profile, test import into a clean state.
- Verify the delete-all-data control requires its intended confirmation and actually clears local data.
- Sign out, then sign back in using email magic link or phone SMS OTP.

## 6. Free billing behavior

- On Spark, confirm paid-only UI is visibly gated.
- Confirm paid CTAs route to checkout rather than silently unlocking a tier.
- Confirm the production build does not honor the local demo-unlock flag.
- Confirm a missing billing configuration fails closed rather than granting paid inventory.

## 7. Stripe subscription test (use Stripe test mode only)

- Start a Rise test checkout.
- Confirm Checkout opens with the expected product/price.
- Complete the test payment.
- Confirm the success page authenticates the session and returns to LIVV.
- Confirm the purchased tier appears in Profile/Settings.
- Refresh the app and confirm the tier remains.
- Confirm the server entitlement is eventually reflected in the client.
- Test Customer Portal from the authenticated account.
- Confirm the portal opens for the current account only.
- Cancel the test subscription through the portal.
- Wait for the webhook lifecycle to process.
- Refresh LIVV and confirm server cancellation removes paid access when the entitlement is hydrated.
- Confirm a network failure does not incorrectly downgrade a previously cached paid user.

## 8. Pack test (Stripe test mode)

- Start a test purchase for one pack.
- Complete Checkout.
- Confirm the success page grants exactly the purchased quantity once.
- Refresh the success URL. Confirm the same session does not duplicate the pack.
- Return to Shop/Packs and confirm the pack is usable.

## 9. Security sanity checks

These should fail safely, not unlock anything:

- Modify local `livv-entitlements-v1` tier in DevTools while online and refresh. Confirm server entitlement behavior is preserved.
- Modify `livv-demo-unlock` in Production. Confirm it does not grant paid access.
- Call `/api/stripe/session` without the authenticated bearer session. Confirm it is rejected.
- Change a checkout `session_id` to a malformed value. Confirm it is rejected.
- Call `/api/stripe/portal` without authentication. Confirm it is rejected.
- Send an oversized JSON body to Evala/Checkout. Confirm it is rejected.

Do not use another customer's Stripe session or customer id in testing.

## 10. Mobile/PWA pass

- Test iPhone-sized viewport.
- Confirm safe-area spacing around the bottom navigation and primary controls.
- Confirm the app icon/manifest loads.
- Use **Add to Home Screen** and launch the installed PWA.
- Confirm the opening screen, navigation, fonts, artwork, and dialogs remain usable in standalone mode.

## 11. Release gate

Ship only when:

- [ ] Opening/onboarding works.
- [ ] Core routes load.
- [ ] Daily/Train/progression persist.
- [ ] Evala responds and recovers from failure.
- [ ] Settings/data export/import/delete work.
- [ ] Email magic-link authentication works end-to-end.
- [ ] Phone SMS OTP authentication works end-to-end.
- [ ] No social/OAuth sign-in or sign-up path is exposed.
- [ ] Spark stays free and paid gates behave correctly.
- [ ] Stripe test subscription completes and survives refresh.
- [ ] Portal ownership works.
- [ ] Cancellation reaches the client through server entitlements.
- [ ] Pack purchase grants exactly once.
- [ ] Production demo unlock cannot grant paid access.
- [ ] Authenticated session checks reject unauthenticated access.
- [ ] Mobile/PWA pass is clean.
- [ ] Current Production deployment is Ready.
- [ ] `/api/health` reports the expected production commit.

If a security check fails, stop the release rather than working around it in the client.
