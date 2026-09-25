import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="livv-page min-h-dvh pb-20 text-livv-ink">
      <div className="mx-auto w-full max-w-2xl px-5 pt-8 sm:px-6">
        <Link href="/auth" className="text-xs font-medium text-livv-muted hover:text-livv-ink">← Back to LIVV</Link>
        <header className="mt-10 border-b border-livv-border pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-livv-muted">Legal</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Terms &amp; Conditions</h1>
          <p className="mt-3 text-sm text-livv-muted">Effective September 24, 2026</p>
        </header>
        <article className="prose prose-sm mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-7">
          <p><strong>In plain English:</strong> LIVV is a lifestyle, training, wellness, learning, and personal-development product. Use it lawfully, use your account responsibly, and understand that its educational content is not professional advice.</p>
          <h2>1. Using LIVV</h2>
          <p>You agree to provide accurate account information and keep access to your account secure. You may not use LIVV to break the law, abuse other people, interfere with the service, scrape or copy the product at scale, or attempt unauthorized access.</p>
          <h2>2. Your account</h2>
          <p>Your account is for you. You are responsible for activity performed through it and for notifying LIVV if you believe your account has been compromised.</p>
          <h2>3. LIVV content</h2>
          <p>LIVV's software, articles, training guidance, product content, branding, designs, and other original materials belong to LIVV or its licensors. They are provided for personal use unless LIVV expressly permits another use.</p>
          <h2>4. Your content</h2>
          <p>You retain ownership of content you submit. You give LIVV the limited rights necessary to store, process, display, and operate that content as part of the service. Do not submit material you do not have the right to use.</p>
          <h2>5. Memberships and billing</h2>
          <p>Membership prices, billing cadence, and included features are shown in LIVV when you subscribe. Payments are processed through Stripe. Subscription management, cancellation, and billing history may be available through the billing portal. Cancellation generally stops future renewal; refund rights depend on the purchase terms and applicable law.</p>
          <h2>6. Shop and physical products</h2>
          <p>When LIVV sells physical products, the applicable product page and checkout control the price, availability, shipping, and purchase details for that order. Availability and product specifications may change.</p>
          <h2>7. Health, training, and lifestyle content</h2>
          <p>LIVV provides educational and organizational tools, not medical, mental-health, legal, financial, or other professional advice. Training and wellness information is general in nature. Consider your own circumstances and consult a qualified professional when appropriate.</p>
          <h2>8. Availability and changes</h2>
          <p>LIVV is evolving. Features may be modified, suspended, or discontinued. We may also update these terms when reasonably necessary. Where required by law, we will provide appropriate notice of material changes.</p>
          <h2>9. Suspension or termination</h2>
          <p>LIVV may suspend or terminate access when reasonably necessary to protect the service or its users, comply with law, or address a material violation of these terms.</p>
          <h2>10. Disclaimers and limits</h2>
          <p>LIVV is provided on an as-available basis. To the extent permitted by law, warranties not expressly stated here are disclaimed. Nothing in these terms limits rights or remedies that cannot legally be limited.</p>
          <h2>11. Contact</h2>
          <p>Questions about these terms should use the current contact information published by LIVV on the website.</p>
        </article>
      </div>
    </main>
  );
}
