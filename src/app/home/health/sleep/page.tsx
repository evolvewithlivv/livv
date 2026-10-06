"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { feedback } from "@/lib/sensory";
import "../health-systems.css";

const KEY = "livv-sleep-v2";
type Entry = { date: string; bedtime: string; wake: string; quality: number; note: string };

function localDate() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function duration(b: string, w: string) {
  if (!b || !w) return 0;
  const a = b.split(":").map(Number);
  const c = w.split(":").map(Number);
  let s = a[0] * 60 + a[1];
  let e = c[0] * 60 + c[1];
  if (e <= s) e += 1440;
  return Math.round(((e - s) / 60) * 10) / 10;
}

export default function SleepPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [bedtime, setBedtime] = useState("");
  const [wake, setWake] = useState("");
  const [quality, setQuality] = useState(3);
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  const recent = useMemo(() => entries.slice(-7).reverse(), [entries]);
  const average = recent.length ? Math.round((recent.reduce((s, e) => s + duration(e.bedtime, e.wake), 0) / recent.length) * 10) / 10 : 0;
  const avgQ = recent.length ? Math.round((recent.reduce((s, e) => s + e.quality, 0) / recent.length) * 10) / 10 : 0;
  const current = duration(bedtime, wake);

  function save() {
    if (!bedtime || !wake) return;
    const next = [...entries.filter((e) => e.date !== localDate()), { date: localDate(), bedtime, wake, quality, note: note.trim() }].slice(-90);
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setBedtime("");
    setWake("");
    setNote("");
    feedback("complete");
  }

  return (
    <main className="hsys" aria-label="Sleep">
      <div className="hsys-inner">
        <Link href="/home/health" className="hsys-back"><ChevronLeft size={13} /> Health</Link>
        <header className="hsys-mast">
          <p className="hsys-k">01 / Recovery</p>
          <h1 className="hsys-title">Sleep</h1>
          <p className="hsys-sub">The most basic recovery signal. Log the night, then let the pattern teach you.</p>
          <div className="hsys-stats">
            <div><strong>{current || "00"}</strong><span>Tonight · hrs</span></div>
            <div><strong>{average || "00"}</strong><span>7-day · avg hrs</span></div>
            <div><strong>{avgQ || "00"}</strong><span>Quality · / 5</span></div>
          </div>
        </header>

        <section className="hsys-section">
          <p className="hsys-label">Log the night</p>
          <label className="hsys-field"><span>Bedtime</span><input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} /></label>
          <label className="hsys-field"><span>Wake</span><input type="time" value={wake} onChange={(e) => setWake(e.target.value)} /></label>
          <div className="hsys-field">
            <span>How did it feel?</span>
            <div className="hsys-chips">
              {[1,2,3,4,5].map((n) => <button key={n} type="button" className={"hsys-chip" + (quality === n ? " on" : "")} onClick={() => setQuality(n)}>{n}</button>)}
            </div>
          </div>
          <label className="hsys-field"><span>Context</span><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Late meal, stress, training, room temperature, screen time..." /></label>
          <button type="button" className="hsys-btn" disabled={!bedtime || !wake} onClick={save}>Save night</button>
        </section>

        <section className="hsys-section">
          <p className="hsys-label">Read the pattern</p>
          <div className="hsys-note">Track the same variables for a few weeks before drawing conclusions. The useful signal is not one bad night. It is what keeps repeating.</div>
          <div className="hsys-list" style={{ marginTop: 14 }}>
            {recent.length === 0 ? <p className="hsys-item-s" style={{ padding: "14px 0" }}>Your first entry will start the record.</p> :
              recent.map((e) => (
                <div key={e.date} className="hsys-item">
                  <div><p className="hsys-item-t">{e.date}</p><p className="hsys-item-s">{e.bedtime} to {e.wake}{e.note ? " · " + e.note : ""}</p></div>
                  <span className="hsys-item-r">{duration(e.bedtime, e.wake)}h · Q{e.quality}</span>
                </div>
              ))}
          </div>
        </section>
        <div className="hsys-note"><Plus size={13} style={{ verticalAlign: -2, marginRight: 5 }} /> Small consistency beats perfect sleep tracking.</div>
      </div>
    </main>
  );
}