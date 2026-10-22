import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import "../legal.css";

export default function PrivacyPage() {
  return (
    <main className="livv-page min-h-dvh pb-20 text-livv-ink">
      <div className="mx-auto w-full max-w-2xl px-5 pt-8 sm:px-6 sm:pt-12">
        <PageHeader className="border-b border-livv-border pb-8" eyebrow="Privacy" trailing={<Link href="/auth" className="text-xs font-medium text-livv-muted hover:text-livv-ink">Back</Link>}>
          <h1 className="text-4xl font-semibold tracking-[-.05em]">Privacy Policy</h1>
          <p className="mt-3 text-sm text-livv-muted">Effective October 22, 2026</p>
        </PageHeader>
        <article className="livv-legal mt-10 max-w-none">
          <p><strong>In plain English:</strong> LIVV collects the information needed to run your account, provide the features you use, process memberships, and keep the service secure. We do not sell your personal information.</p>
          <h2>1. Information you give us</h2>
          <p>This can include your email address, display name, profile photo, onboarding responses, goals, interests, journal entries, training and progress information, health and wellness tracking, and account preferences.</p>
          <h2>2. Information created through use</h2>
          <p>We may create and store records needed for daily check-ins, workouts, health tracking, saved Mind content, membership status, profile settings, and product purchases. Progress, onboarding answers, and health or wellness logs kept on your device under LIVV storage keys can also be copied to your Supabase account so they can be restored when you sign in again.</p>
          <h2>3. How we use information</h2>
          <ul><li>Authenticate and maintain your account.</li><li>Provide, personalize, and improve LIVV features.</li><li>Save your progress and preferences.</li><li>Process memberships and purchases.</li><li>Send account, security, and service communications.</li><li>Prevent abuse, troubleshoot issues, and protect the service.</li></ul>
          <h2>4. Service providers</h2>
          <p>LIVV uses these providers to operate the product. Each processes information as needed to provide its service under its own terms:</p>
          <ul>
            <li>Supabase provides authentication, the database, and account storage. Sign-in codes are emailed through Supabase Auth. Before an email account exists, the app may create an anonymous Supabase session on that device. An anonymous session is not treated as a signed-in member account.</li>
            <li>Vercel hosts the application and may process operational logs. When its web analytics script is present, it may measure page views on the public landing page.</li>
            <li>PostHog, in the United States, processes product analytics such as page views and actions in the product. Those events do not include your email, your name, or journal text. Session recording is off. This analytics data is not sold.</li>
            <li>Stripe processes payment information for an existing billing relationship and the billing portal. LIVV does not store your full payment-card number.</li>
          </ul>
          <p>Sign-in email is sent by Supabase Auth. This repository does not call Resend. The hosting project has a Resend API key configured, so Resend may still be used outside this codebase, including as the authentication email provider.</p>
          <h2>5. Payments</h2>
          <p>New paid membership checkout is not offered, and core access is free. If you already have a Stripe billing relationship, Stripe may still process that billing information under Stripe&apos;s privacy policy, and the billing portal remains available for that relationship.</p>
          <h2>6. Sharing</h2>
          <p>We may disclose information to service providers, when required by law, to protect LIVV or its users, or in connection with a merger, acquisition, financing, or sale of assets. We do not sell your personal information.</p>
          <h2>7. Your choices</h2>
          <p>You control the optional information you add to your profile and journal. You may stop using LIVV at any time. Settings can export or clear a subset of progress stored on this device. That file is not a full copy of your account, and clearing it does not delete your account or the records stored with Supabase. To access, correct, or delete account information, email <a href="mailto:privacy@evolvewithlivv.com">privacy@evolvewithlivv.com</a>. This version has no in-app account deletion control.</p>
          <h2>8. Security and retention</h2>
          <p>We use reasonable technical and organizational safeguards intended to protect information. No internet service can guarantee absolute security. We retain information for as long as reasonably necessary to operate LIVV, meet legal obligations, resolve disputes, prevent abuse, and enforce agreements.</p>
          <h2>9. Children</h2>
          <p>LIVV is not directed to children under 13, and we do not knowingly collect personal information from children under 13.</p>
          <h2>10. Wellness information</h2>
          <p>Some LIVV features let you record health and wellness information. These tools are designed for personal organization and wellness tracking. LIVV is not a medical provider and does not provide diagnosis or treatment.</p>
          <h2>11. Changes</h2>
          <p>We may update this policy as LIVV changes. The effective date at the top identifies the current version.</p>
          <h2>12. Copyright</h2><p>Copyright complaints are handled under the <a href="/legal/dmca" className="underline">DMCA &amp; Copyright Policy</a>.</p><h2>13. Contact</h2>
          <p>For privacy questions or requests, email <a href="mailto:privacy@evolvewithlivv.com">privacy@evolvewithlivv.com</a>.</p>
        </article>
      </div>
    </main>
  );
}
