import Link from "next/link";
import { ArrowLeft, ExternalLink, Leaf, ShieldCheck } from "lucide-react";
import { FIELD_GUIDES, getFieldGuide } from "@/lib/field-guides";
import "@/app/home/field/guides/[slug]/field-guide.css";

export function generateStaticParams() {
  return FIELD_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = false;

export const metadata = { title: "Offline Field Guide · LIVV", robots: { index: false, follow: false } };

export default async function OfflineFieldGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getFieldGuide(slug);
  if (!guide) {
    return <main className="field-guide"><div className="field-guide-inner"><p className="field-guide-k">LIVV / FIELD / OFFLINE</p><h1 className="field-guide-title">Guide unavailable.</h1><p className="field-guide-intro">This guide has not been included in the offline library.</p></div></main>;
  }

  return (
    <main className="field-guide" aria-label={guide.title}>
      <div className="field-guide-inner">
        <Link href={`/home/field/guides/${guide.slug}`} className="field-guide-back"><ArrowLeft size={14} /> Regular guide</Link>
        <header className="field-guide-hero">
          <p className="field-guide-k">LIVV / FIELD / OFFLINE COPY</p>
          <div className="field-guide-title-row"><h1 className="field-guide-title">{guide.title}.</h1><span className="field-guide-mark" aria-hidden="true"><Leaf size={23} /></span></div>
          <p className="field-guide-intro">{guide.summary}</p>
          <div className="field-guide-meta"><span>{guide.level}</span><span>{guide.duration}</span><span><ShieldCheck size={13} /> Read-only offline copy</span></div>
          <p className="field-guide-save-note">This page is a saved, read-only copy of the instructional guide. Source links require a connection. Your checklist and field notes remain in the regular guide on this device and sync when LIVV is online.</p>
        </header>

        <section className="field-guide-section">
          <p className="field-guide-overline">01 / Understand</p><h2>Before you begin</h2><p className="field-guide-body">{guide.overview}</p>
          <div className="field-guide-budget"><span>Starter budget</span><p>{guide.budgetEstimate}</p></div>
          <h3>Before you start</h3><ul className="field-guide-prerequisites">{guide.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>What you need</h3><ul className="field-guide-supplies">{guide.supplies.map((item) => <li key={item.item}><span>{item.item}{item.optional ? " · optional" : ""}</span><small>{item.amount}</small></li>)}</ul>
          <div className="field-guide-safety"><ShieldCheck size={17} /><div><h3>Safety first</h3><ul>{guide.safety.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
        </section>

        <section className="field-guide-section">
          <p className="field-guide-overline">02 / Do the work</p><h2>Step by step</h2>
          <div className="field-guide-steps">{guide.steps.map((step, index) => <article key={step.id} className="field-guide-step"><div className="field-guide-step-toggle"><span className="field-guide-step-number">{String(index + 1).padStart(2, "0")}</span><span className="field-guide-step-heading"><strong>{step.title}</strong>{step.timing && <small>{step.timing}</small>}</span></div><div className="field-guide-step-content"><p>{step.instruction}</p><p className="field-guide-step-detail">{step.detail}</p><div className="field-guide-checkpoint"><strong>Checkpoint</strong><span>{step.checkpoint}</span></div></div></article>)}</div>
        </section>

        <section className="field-guide-section">
          <p className="field-guide-overline">03 / Troubleshoot</p><h2>When something goes wrong</h2>
          <div className="field-guide-troubleshooting">{guide.troubleshoot.map((item) => <article key={item.problem}><h3>{item.problem}</h3><p><strong>Possible cause:</strong> {item.cause}</p><p><strong>What to do:</strong> {item.response}</p></article>)}</div>
        </section>

        <section className="field-guide-section">
          <p className="field-guide-overline">04 / Verify</p><h2>Can you do it?</h2>
          <ul className="field-guide-prerequisites">{guide.verification.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="field-guide-body">When you are back online, open the regular guide to record completed steps, verification checks, and field notes.</p>
        </section>

        <section className="field-guide-section">
          <p className="field-guide-overline">05 / Maintain</p><h2>Keep the skill alive</h2>
          <ul className="field-guide-maintenance">{guide.maintenance.map((item) => <li key={item}><span>{item}</span></li>)}</ul>
        </section>

        <section className="field-guide-section field-guide-sources">
          <p className="field-guide-overline">Reference / Content integrity</p><h2>Sources and review</h2>
          <p className="field-guide-body">The guide was checked against the references below. These links may be unavailable without a connection.</p>
          {guide.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span><strong>{source.title}</strong><small>{source.publisher} · checked {source.checked}</small></span><ExternalLink size={15} /></a>)}
          <p className="field-guide-review">Guide review date: {guide.reviewedAt}. Content status: {guide.reviewStatus === "reviewed" ? "source-checked instructional guide" : "draft awaiting review"}.</p>
        </section>
        <footer className="field-guide-footer"><Link href={`/home/field/guides/${guide.slug}`} className="field-guide-primary"><ArrowLeft size={15} /> Return to regular guide</Link><p>Capability is built by doing, observing, and repeating.</p></footer>
      </div>
    </main>
  );
}
