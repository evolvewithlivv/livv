import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="livv-page min-h-dvh pb-16 text-livv-ink">
      <div className="mx-auto w-full max-w-2xl px-5 pt-10 sm:px-6">
        <Link href="/auth" className="text-xs text-livv-muted hover:underline">Back to LIVV</Link>
        <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">Legal</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Terms &amp; Conditions</h1>
        <p className="mt-3 text-sm text-livv-muted">Effective September 24, 2026</p>

        <div className="prose prose-sm mt-10 max-w-none prose-headings:tracking-tight prose-p:leading-7">
          <p>These Terms &amp; Conditions govern your use of LIVV. By creating an account or using LIVV, you agree to these terms.</p>

          <h2>Using LIVV</h2>
          <p>You must provide accurate information when creating an account and keep your account credentials and access secure. You are responsible for activity occurring through your account. Do not use LIVV to violate applicable law, interfere with the service, abuse other users, or attempt to gain unauthorized access.</p>

          <h2>LIVV content</h2>
          <p>LIVV's articles, training guidance, product content, software, branding, designs, and other original materials are provided for personal use unless LIVV expressly permits another use. You may not copy, resell, distribute, reverse engineer, or exploit the service or its content except as permitted by law.</p>

          <h2>User content</h2>
          <p>You retain ownership of content you submit to LIVV, subject to the rights needed for LIVV to store, display, and operate that content within the service. Do not submit content you do not have the right to use.</p>

          <h2>Memberships and billing</h2>
          <p>Some LIVV features require a paid membership. Prices, billing cadence, and included features are shown at checkout or in the membership area. Paid memberships are processed through Stripe. Subscription changes, cancellations, and billing management may be handled through the available billing portal. A cancellation generally stops future renewal; any refund rights are governed by the applicable purchase terms and law.</p>

          <h2>Shop and physical products</h2>
          <p>When physical LIVV products are offered, product-specific pricing, availability, shipping, and other purchase terms will be shown at the time of purchase. Product availability may change.</p>

          <h2>Health and lifestyle information</h2>
          <p>LIVV provides lifestyle, fitness, educational, and organizational tools. LIVV content is not medical, mental-health, legal, financial, or other professional advice and should not be treated as a substitute for a qualified professional.</p>

          <h2>Availability and changes</h2>
          <p>LIVV may modify, suspend, or discontinue features as the product evolves. We may also update these terms when reasonably necessary. Continued use after an updated version becomes effective constitutes acceptance of the updated terms where permitted by law.</p>

          <h2>Termination</h2>
          <p>LIVV may suspend or terminate access when reasonably necessary to protect the service, users, or comply with law, including for material violations of these terms.</p>

          <h2>Disclaimers</h2>
          <p>LIVV is provided on an as-available basis. To the extent permitted by law, LIVV disclaims warranties not expressly stated in these terms. Nothing here limits rights that cannot legally be limited.</p>

          <h2>Contact</h2>
          <p>Questions about these terms should be directed to the current contact information published by LIVV on its website.</p>
        </div>
      </div>
    </main>
  );
}
