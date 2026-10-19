import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Leaf, ShieldCheck } from "lucide-react";
import { FIELD_GUIDES, getFieldGuide } from "@/lib/field-guides";
import "../../public-share.css";

export function generateStaticParams() { return FIELD_GUIDES.map((guide) => ({ slug: guide.slug })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getFieldGuide(slug);
  return { title: guide ? `${guide.title} · LIVV Field` : "Field guide · LIVV", description: guide?.summary, robots: { index: true, follow: true } };
}
export default async function PublicFieldGuide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getFieldGuide(slug);
  if (!guide) notFound();
  return <main className="public-share"><article className="public-share-inner">
    <div className="public-brand">LIVV · Field</div>
    <p className="public-eyebrow">{guide.eyebrow}</p><h1>{guide.title}</h1><p className="public-lede">{guide.summary}</p>
    <div className="public-meta"><span>{guide.level}</span><span>{guide.duration}</span><span><ShieldCheck size={13} style={{display:"inline",verticalAlign:"-2px"}}/> Sources included</span></div>
    <section className="public-section"><p className="public-eyebrow" style={{marginTop:0}}>01 / Understand</p><h2>Before you begin</h2><p>{guide.overview}</p><h3>Starter budget</h3><p>{guide.budgetEstimate}</p><h3>Before you start</h3><ul>{guide.prerequisites.map(x=><li key={x}>{x}</li>)}</ul><h3>What you need</h3>{guide.supplies.map(x=><div className="public-supply" key={x.item}><strong>{x.item}{x.optional?" · optional":""}</strong><span>{x.amount}</span></div)}<h3><ShieldCheck size={15} style={{display:"inline",verticalAlign:"-2px"}}/> Safety first</h3><ul>{guide.safety.map(x=><li key={x}>{x}</li>)}</ul></section>
    <section className="public-section"><p className="public-eyebrow" style={{marginTop:0}}>02 / Do the work</p><h2>Step by step</h2>{guide.steps.map((step,i)=><div className="public-step" key={step.id}><h3>{String(i+1).padStart(2,"0")} · {step.title}</h3>{step.timing&&<p><strong>Timing:</strong> {step.timing}</p>}<p>{step.instruction}</p><p>{step.detail}</p><p><strong>Checkpoint:</strong> {step.checkpoint}</p></div>)}</section>
    <section className="public-section"><p className="public-eyebrow" style={{marginTop:0}}>03 / Troubleshoot</p><h2>When something goes wrong</h2>{guide.troubleshoot.map(x=><div className="public-step" key={x.problem}><h3>{x.problem}</h3><p><strong>Possible cause:</strong> {x.cause}</p><p><strong>What to do:</strong> {x.response}</p></div>)}</section>
    <section className="public-section"><p className="public-eyebrow" style={{marginTop:0}}>04 / Maintain</p><h2>Keep the skill alive</h2><ul>{guide.maintenance.map(x=><li key={x}>{x}</li>)}</ul></section>
    <section className="public-section"><p className="public-eyebrow" style={{marginTop:0}}>Reference / Content integrity</p><h2>Sources and review</h2><p>Review date: {guide.reviewedAt}. Status: {guide.reviewStatus==="reviewed"?"source-checked instructional guide":"draft awaiting review"}.</p>{guide.sources.map(x=><p key={x.url}><a href={x.url} target="_blank" rel="noreferrer" style={{color:"inherit"}}>{x.title} · {x.publisher} <ExternalLink size={12} style={{display:"inline",verticalAlign:"-2px"}}/></a><br/>Checked {x.checked}</p>)}</section>
    <section className="public-cta"><h2>Put knowledge to work.</h2><p>LIVV helps you build practical capability across your health, skills, and everyday life. Explore it for yourself.</p><Link href="/auth?mode=signup&src=shared_field_guide">Explore LIVV</Link></section><footer className="public-foot">LIVV · Evolve with purpose</footer>
  </article></main>;
}
