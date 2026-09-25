import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="livv-page min-h-dvh pb-20 text-livv-ink">
      <div className="mx-auto w-full max-w-2xl px-5 pt-8 sm:px-6 sm:pt-12">
        <Link href="/auth" className="text-xs font-medium text-livv-muted hover:text-livv-ink">← Back to LIVV</Link>
        <header className="mt-10 border-b border-livv-border pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-livv-muted">Legal</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Privacy Policy</h1>
          <p className="mt-3 text-sm text-livv-muted">Effective September 24, 2026</p>
        </header>
        <article className="prose prose-sm mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-7">
          <p><strong>In plain English:</strong> LIVV collects the information needed to run your account, provide the features you use, process memberships, and keep the service secure. We do not sell your personal information.</p>
          <h2>1. Information you give us</h2>
          <p>This can include your email address, display name, profile photo, onboarding responses, goals, interests, journal entries, training and progress information, health and wellness tracking, and account preferences.</p>
          <h2>2. Information created through use</h2>
          <p>We may create and store records needed for daily check-ins, workouts, health tracking, saved Mind content, membership status, profile settings, and product purchases.</p>
          <h2>3. How we use information</h2>
          <ul><li>Authenticate and maintain your account.</li><li>Provide, personalize, and improve LIVV features.</li><li>Save your progress and preferences.</li><li>Process memberships and purchases.</li><li>Send account, security, and service communications.</li><li>Prevent abuse, troubleshoot issues, and protect the service.</li></ul>
          <h2>4. Service providers</h2>
          <p>LIVV uses third-party infrastructure to operate the product, including hosting, authentication, database, email, payments, and related technical services. These providers process information as needed to provide their services under their own terms and policies.</p>
          <h2>5. Payments</h2>
          <p>Membership payments are processed by Stripe. LIVV does not need to store your full payment-card number. Stripe may process billing information under Stripe's own privacy policy and terms.</p>
          <h2>6. Sharing</h2>
          <p>We may disclose information to service providers, when required by law, to protect LIVV or its users, or in connection with a merger, acquisition, financing, or sale of assets. We do not sell your personal information.</p>
          <h2>7. Your choices</h2>
          <p>You control the optional information you add to your profile and journal. You may stop using LIVV at any time. Requests to access, correct, or delete account information should use the current contact method published on the LIVV website.</p>
          <h2>8. Security and retention</h2>
          <p>We use reasonable technical and organizational safeguards intended to protect information. No internet service can guarantee absolute security. We retain information for as long as reasonably necessary to operate LIVV, meet legal obligations, resolve disputes, prevent abuse, and enforce agreements.</p>
          <h2>9. Children</h2>
          <p>LIVV is not directed to children under 13, and we do not knowingly collect personal information from children under 13.</p>
          <h2>10. Wellness information</h2>
          <p>Some LIVV features let you record health and wellness information. These tools are designed for personal organization and wellness tracking. LIVV is not a medical provider and does not provide diagnosis or treatment.</p>
          <h2>11. Changes</h2>
          <p>We may update this policy as LIVV changes. The effective date at the top identifies the current version.</p>
          <h2>12. Contact</h2>
          <p>For privacy questions or requests, use the current contact information published by LIVV on the website.</p>
        </article>
      </div>
    </main>
  );
}
