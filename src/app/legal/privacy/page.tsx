import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="livv-page min-h-dvh pb-16 text-livv-ink">
      <div className="mx-auto w-full max-w-2xl px-5 pt-10 sm:px-6">
        <Link href="/auth" className="text-xs text-livv-muted hover:underline">Back to LIVV</Link>
        <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">Legal</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Privacy Policy</h1>
        <p className="mt-3 text-sm text-livv-muted">Effective September 24, 2026</p>

        <div className="prose prose-sm mt-10 max-w-none prose-headings:tracking-tight prose-p:leading-7">
          <p>LIVV is a lifestyle and personal-development platform. This policy explains the categories of information LIVV may collect, how that information is used, and the choices available to you.</p>

          <h2>Information you provide</h2>
          <p>When you create and use a LIVV account, you may provide an email address, display name, profile photo, onboarding responses, goals, interests, journal entries, progress information, and other information you choose to add to the product.</p>

          <h2>Information created through use</h2>
          <p>LIVV may store information needed to operate features such as daily check-ins, training, health and progress tracking, saved Mind articles, membership status, and account preferences.</p>

          <h2>Payments</h2>
          <p>Paid memberships are processed through Stripe. LIVV does not need to store your full payment-card number to provide the membership service. Stripe may process payment and billing information under its own privacy terms.</p>

          <h2>Authentication and service providers</h2>
          <p>LIVV uses third-party infrastructure providers to operate the service, including authentication, database, hosting, email, payments, and related technical services. These providers may process information on LIVV's behalf as necessary to provide their services.</p>

          <h2>How information is used</h2>
          <p>Information may be used to authenticate your account, provide and personalize LIVV features, maintain your progress, process memberships, communicate about your account, prevent abuse, troubleshoot problems, and improve the service.</p>

          <h2>Information sharing</h2>
          <p>LIVV does not sell your personal information. Information may be disclosed to service providers operating the platform, when required by law, to protect the service and its users, or as part of a business transaction such as a merger, acquisition, or asset sale.</p>

          <h2>Your choices</h2>
          <p>You can choose what optional profile, journal, and onboarding information you provide. You can also stop using LIVV. Requests concerning access, correction, or deletion of account information should be directed to LIVV through the contact method provided on the current LIVV website.</p>

          <h2>Children</h2>
          <p>LIVV is not directed to children under 13, and LIVV does not knowingly collect personal information from children under 13.</p>

          <h2>Security and retention</h2>
          <p>LIVV uses reasonable technical and organizational measures intended to protect information. No internet service can guarantee absolute security. Information may be retained for as long as reasonably necessary to operate the service, satisfy legal obligations, resolve disputes, and enforce agreements.</p>

          <h2>Changes to this policy</h2>
          <p>This policy may be updated as LIVV changes. The effective date above will identify the current version.</p>

          <h2>Contact</h2>
          <p>For privacy questions or requests, use the current contact information published by LIVV on its website.</p>
        </div>
      </div>
    </main>
  );
}
