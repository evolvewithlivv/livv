"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Leaf, PawPrint, Droplets, Sun, Sprout, Wheat } from "lucide-react";
import "./field.css";

const GROW = [
  { name: "Leafy greens", window: "Cool season", note: "Fast crops for repeated harvests." },
  { name: "Root crops", window: "Cool to mild", note: "Carrots, beets, radishes, and similar storage-friendly crops." },
  { name: "Beans", window: "Warm season", note: "Simple, productive, and useful for building a food reserve." },
  { name: "Tomatoes", window: "Warm season", note: "High-value garden crop; support and steady watering matter." },
  { name: "Herbs", window: "Most seasons", note: "Small footprint, high daily usefulness." },
  { name: "Winter crops", window: "Cold season", note: "Plan the next season before the current one ends." },
];

const KEEP = [
  ["Chickens", "Eggs · manure · pest control", "Daily water, secure housing, clean bedding, predator protection."],
  ["Rabbits", "Meat · manure", "Clean housing, shade, fresh water, and responsible care."],
  ["Bees", "Pollination · honey", "Requires specialized training, equipment, and seasonal management."],
  ["Compost", "Soil fertility", "Return useful organic matter to the system instead of treating it as waste."],
];

const STORAGE = [
  "Drying and dehydrating",
  "Freezing",
  "Root-cellar style storage",
  "Fermentation",
  "Seed saving",
  "Basic water storage and filtration",
];

export default function FieldPage() {
  const [checked, setChecked] = useState<string[]>([]);
  const progress = useMemo(() => Math.round((checked.length / STORAGE.length) * 100), [checked]);
  const toggle = (item: string) => setChecked((p) => p.includes(item) ? p.filter(x => x !== item) : [...p, item]);

  return <main className="field" aria-label="LIVV Field">
    <div className="field-inner">
      <Link href="/home" className="field-back"><ChevronLeft size={14}/> Home</Link>
      <header className="field-hero">
        <p className="field-k">LIVV / FIELD</p>
        <h1>Become harder to depend on.</h1>
        <p>Grow food. Keep useful animals responsibly. Preserve what you produce. Build practical capability instead of outsourcing every basic need.</p>
      </header>

      <section className="field-orbit">
        <div><Leaf size={17}/><span>Grow</span></div>
        <div><PawPrint size={17}/><span>Keep</span></div>
        <div><Wheat size={17}/><span>Preserve</span></div>
        <div><Droplets size={17}/><span>Store</span></div>
      </section>

      <section className="field-section">
        <div className="field-section-head"><div><span>01</span><h2>Grow</h2></div><Sprout size={18}/></div>
        <p className="field-copy">Start with crops that fit your space, season, water, and actual ability to maintain them.</p>
        <div className="field-list">{GROW.map(item => <article key={item.name} className="field-card"><div><strong>{item.name}</strong><span>{item.window}</span></div><p>{item.note}</p></article>)}</div>
      </section>

      <section className="field-section">
        <div className="field-section-head"><div><span>02</span><h2>Keep</h2></div><PawPrint size={18}/></div>
        <p className="field-copy">Animals are a responsibility before they are a resource. Learn care, housing, feed, health, and local rules first.</p>
        <div className="field-list">{KEEP.map(([name,use,note]) => <article key={name} className="field-card"><div><strong>{name}</strong><span>{use}</span></div><p>{note}</p></article>)}</div>
      </section>

      <section className="field-section">
        <div className="field-section-head"><div><span>03</span><h2>Preserve</h2></div><Sun size={18}/></div>
        <p className="field-copy">Self-sufficiency compounds when what you grow can outlast the day it was harvested.</p>
        <div className="field-progress"><span>{progress}% of your preservation fundamentals</span><i><b style={{width: progress + "%"}}/></i></div>
        <div className="field-checks">{STORAGE.map(item => <button key={item} type="button" className={checked.includes(item) ? "on" : ""} onClick={() => toggle(item)}><span>{checked.includes(item) ? "✓" : ""}</span>{item}</button>)}</div>
      </section>

      <p className="field-note">LIVV Field is practical education and tracking, not agricultural, veterinary, or legal advice. Local climate, regulations, and animal-welfare requirements matter.</p>
    </div>
  </main>;
}
