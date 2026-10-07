import Link from "next/link";

export default function DmcaPage() {
  return (
    <main className="livv-page min-h-dvh pb-20 text-livv-ink">
      <div className="mx-auto w-full max-w-2xl px-5 pt-8 sm:px-6 sm:pt-12">
        <Link href="/legal/terms" className="text-xs font-medium text-livv-muted hover:text-livv-ink">Back to Legal</Link>
        <header className="mt-10 border-b border-livv-border pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-livv-muted">Legal / Copyright</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">DMCA & Copyright Policy</h1>
          <p className="mt-3 text-sm text-livv-muted">Effective October 6, 2026</p>
        </header>
        <article className="prose prose-sm mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-7">
          <p><strong>In plain English:</strong> do not upload or share material you do not have the right to use. If you believe material on LIVV infringes your copyright, send a notice using the contact below.</p>
          <h2>1. User content</h2>
          <p>LIVV lets members add profile information, photos, writing, and other material. Members retain ownership of their content and are responsible for having the rights needed to submit it.</p>
          <h2>2. Copyright complaints</h2>
          <p>A copyright notice should identify the copyrighted work, identify the material you believe is infringing, provide enough information for us to locate it, include your contact information, include a good-faith statement that the use is not authorized, include a statement under penalty of perjury that the information is accurate and that you are authorized to act, and include your physical or electronic signature.</p>
          <h2>3. Where to send a notice</h2>
          <p>Email copyright notices to <a href="mailto:evolvewithlivv@gmail.com">evolvewithlivv@gmail.com</a> with the subject line <strong>DMCA NOTICE</strong>. We may request additional information before taking action.</p>
          <h2>4. Counter-notices</h2>
          <p>If material was removed because of a copyright complaint and you believe the removal was mistaken, you may send a counter-notice containing the information required by applicable law. We may restore material when legally permitted.</p>
          <h2>5. Repeat infringement</h2>
          <p>LIVV may restrict or terminate accounts that repeatedly submit infringing material or otherwise abuse the service.</p>
          <h2>6. Designated agent</h2>
          <p>Evolve With LIVV will maintain a designated copyright contact and, where applicable, register the designated agent with the U.S. Copyright Office. The public contact for copyright notices is evolvewithlivv@gmail.com.</p>
          <p className="text-xs text-livv-muted">This page describes LIVV's operational policy. It is not legal advice. A formal safe-harbor designation requires a current registration and accurate agent information with the U.S. Copyright Office.</p>
        </article>
      </div>
    </main>
  );
}
