"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import "../health-systems.css";

const KEY = "livv-sleep-v2";
type Entry = { date: string; bedtime: string; wake: string; quality: number; note: string };

function today() {
  return new Date().toISOString().slice(0, 10);
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
  const average = recent.length
    ? Math.round(
        (recent.reduce((s, e) => s + duration(e.bedtime, e.wake), 0) / recent.length) * 10,
      ) / 10
    : 0;
  const current = duration(bedtime, wake);
  const avgQ = recent.length
    ? Math.round((recent.reduce((s, e) => s + e.quality, 0) / recent.length) * 10) / 10
    : 0;

  function save() {
    if (!bedtime || !wake) return;
    const next = [
      ...entries.filter((e) => e.date !== today()),
      { date: today(), bedtime, wake, quality, note: note.trim() },
    ].slice(-90);
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setBedtime("");
    setWake("");
    setNote("");
  }

  return (
    <main className="hsys" aria-label="Sleep">
      <div className="hsys-inner">
        <Link href="/home/health" className="hsys-back">
          <ChevronLeft size={13} /> Health
        </Link>
        <header className="hsys-mast">
          <p className="hsys-k">Recovery</p>
          <h1 className="hsys-title">Sleep</h1>
          <p className="hsys-sub">Log the night. See the pattern.</p>
          <div className="hsys-stats">
            <div>
              <strong>{current || "—"}</strong>
              <span>Tonight</span>
            </div>
            <div>
              <strong>{average || "—"}</strong>
              <span>7-day avg</span>
            </div>
            <div>
              <strong>{avgQ || "—"}</strong>
              <span>Quality</span>
            </div>
          </div>
        </header>

        <section className="hsys-section">
          <p className="hsys-label">Log</p>
          <label className="hsys-field">
            <span>Bedtime</span>
            <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
          </label>
          <label className="hsys-field">
            <span>Wake</span>
            <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} />
          </label>
          <div className="hsys-field">
            <span>Quality</span>
            <div className="hsys-chips">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={"hsys-chip" + (quality === n ? " on" : "")}
                  onClick={() => setQuality(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <label className="hsys-field">
            <span>Note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What affected the night?"
            />
          </label>
          <button type="button" className="hsys-btn" disabled={!bedtime || !wake} onClick={save}>
            Save night
          </button>
        </section>

        <section className="hsys-section">
          <p className="hsys-label">Recent</p>
          <div className="hsys-list">
            {recent.length === 0 ? (
              <p className="hsys-item-s" style={{ padding: "1rem 0" }}>
                No nights logged yet.
              </p>
            ) : (
              recent.map((e) => (
                <div key={e.date} className="hsys-item">
                  <div>
                    <p className="hsys-item-t">{e.date}</p>
                    <p className="hsys-item-s">
                      {e.bedtime} → {e.wake}
                      {e.note ? ` · ${e.note}` : ""}
                    </p>
                  </div>
                  <span className="hsys-item-r">
                    {duration(e.bedtime, e.wake)}h · Q{e.quality}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
