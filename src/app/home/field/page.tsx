"use client";

import Link from "next/link";
import { ChevronLeft, Leaf, PawPrint, Droplets, Sun, Sprout, Wheat, ArrowUpRight, BookOpen, ShieldCheck } from "lucide-react";
import "./field.css";

const GROW = [
  { name: "Leafy greens", window: "Cool season", note: "Learn to sow, thin, water, troubleshoot, and harvest a first crop.", slug: "grow-leafy-greens", ready: true },
  { name: "Root crops", window: "Cool to mild", note: "Carrots, beets, radishes, and other storage-friendly crops.", ready: false },
  { name: "Beans", window: "Warm season", note: "Choose a variety, build support, water, harvest, and learn when pods are ready.", slug: "grow-beans", ready: true },
  { name: "Tomatoes", window: "Warm season", note: "Seedlings, support, pruning choices, watering, and harvest.", ready: false },
  { name: "Herbs", window: "Most seasons", note: "Match light and water to each herb, harvest well, and keep useful plants productive.", slug: "grow-herbs", ready: true },
  { name: "Winter crops", window: "Cold season", note: "Plan sowing, protection, and harvest around local conditions.", ready: false },
];

const KEEP = [
  { name: "Chickens", use: "Eggs · manure · pest control", note: "Housing, daily care, nutrition, biosecurity, and local rules." },
  { name: "Rabbits", use: "Species-specific care", note: "Housing, diet, temperature, enrichment, and veterinary care." },
  { name: "Bees", use: "Pollination · honey", note: "Assess the site, learn with a mentor, and plan colony health and seasonal care.", slug: "keep-bees", ready: true },
  { name: "Compost", use: "Soil fertility", note: "Balance materials, moisture, airflow, and safe finished compost.", slug: "keep-compost", ready: true },
];

const PRESERVE = [
  { name: "Green beans", note: "Freeze a harvest using tested blanching, cooling, packaging, and labeling steps.", slug: "preserve-green-beans", ready: true },
  { name: "Drying and dehydrating", note: "Choose suitable foods, prepare evenly, dry fully, and store correctly." },
  { name: "Fermentation", note: "Follow one tested recipe, control salt and temperature, and store the batch safely.", slug: "preserve-fermented-vegetables", ready: true },
  { name: "Canning", note: "Follow tested recipes and correct processing methods for each food." },
];

const STORE = [
  { name: "Food reserve", note: "Estimate household needs, rotate supplies, and plan within a budget." },
  { name: "Drinking water", note: "Calculate a household reserve, choose safe containers, label dates, and rotate stored water.", slug: "store-emergency-water", ready: true },
  { name: "Tools and essentials", note: "Keep an inventory, protect supplies, and make important items easy to find." },
];

function TopicList({ items }: { items: { name: string; note: string; window?: string; slug?: string; ready?: boolean; use?: string }[] }) {
  return <div className="field-list">{items.map((item) => {
    const content = <><div><strong>{item.name}</strong><span>{item.window || item.use || (item.ready ? "Guide available" : "Guide in development")}</span></div><p>{item.note}</p>{item.ready && <span className="field-card-action">Open complete guide <ArrowUpRight size={13} /></span>}</>;
    return item.ready && item.slug
      ? <Link key={item.name} href={`/home/field/guides/${item.slug}`} className="field-card field-card-link">{content}</Link>
      : <article key={item.name} className="field-card">{content}</article>;
  })}</div>;
}

export default function FieldPage() {
  return <main className="field" aria-label="LIVV Field">
    <div className="field-inner">
      <Link href="/home" className="field-back"><ChevronLeft size={14}/> Home</Link>
      <header className="field-hero">
        <p className="field-k">LIVV / FIELD</p>
        <h1>Become harder to depend on.</h1>
        <p>Learn to grow food, care for living things, preserve what you produce, and store what your household needs. Build practical capability instead of outsourcing every basic need.</p>
      </header>

      <section className="field-orbit" aria-label="Field pillars">
        <a href="#grow"><Leaf size={17}/><span>Grow</span></a>
        <a href="#keep"><PawPrint size={17}/><span>Keep</span></a>
        <a href="#preserve"><Wheat size={17}/><span>Preserve</span></a>
        <a href="#store"><Droplets size={17}/><span>Store</span></a>
      </section>

      <section className="field-section" id="grow">
        <div className="field-section-head"><div><span>01</span><h2>Grow</h2></div><Sprout size={18}/></div>
        <p className="field-copy">Learn the whole process: choosing a crop, setting it up, caring for it, solving problems, and harvesting what you grow.</p>
        <TopicList items={GROW} />
      </section>

      <section className="field-section" id="keep">
        <div className="field-section-head"><div><span>02</span><h2>Keep</h2></div><PawPrint size={18}/></div>
        <p className="field-copy">Animals are a responsibility before they are a resource. Learn housing, nutrition, daily care, welfare, and when expert help is needed.</p>
        <TopicList items={KEEP} />
      </section>

      <section className="field-section" id="preserve">
        <div className="field-section-head"><div><span>03</span><h2>Preserve</h2></div><Sun size={18}/></div>
        <p className="field-copy">Turn a harvest into food you can use later. Food safety is part of the method, not an optional footnote.</p>
        <div className="field-guide-principle"><ShieldCheck size={16}/><p>Canning and fermentation instructions must come from tested, food-safe procedures. We will not publish guessed processing times or storage guarantees.</p></div>
        <TopicList items={PRESERVE} />
      </section>

      <section className="field-section" id="store">
        <div className="field-section-head"><div><span>04</span><h2>Store</h2></div><Droplets size={18}/></div>
        <p className="field-copy">Know what you have, how long it remains usable, and what your household needs if normal supply is interrupted.</p>
        <TopicList items={STORE} />
      </section>

      <section className="field-next">
        <BookOpen size={17}/>
        <div><strong>One skill at a time.</strong><p>Field guides are built as complete instructions, not quick tips. Eight complete guides are available now across the four pillars. Other topics will appear when their guidance and sources are ready.</p></div>
      </section>

      <p className="field-note">Field is practical education, not a substitute for local agricultural guidance, veterinary care, food-safety requirements, or emergency services. Follow local conditions and applicable rules.</p>
    </div>
  </main>;
}
