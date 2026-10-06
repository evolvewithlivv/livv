"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import "../health-systems.css";

type Activity = "Walk" | "Run" | "Bike";
type Log = {
  id: string;
  date: string;
  activity: Activity;
  distance: number;
  duration: number;
  note: string;
};

const KEY = "livv-trails-v2";

function miles(a: GeolocationCoordinates, b: GeolocationCoordinates) {
  const R = 3958.8;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export default function TrailsPage() {
  const [a, setA] = useState<Activity>("Walk");
  const [run, setRun] = useState(false);
  const [sec, setSec] = useState(0);
  const [dist, setDist] = useState(0);
  const [logs, setLogs] = useState<Log[]>([]);
  const [note, setNote] = useState("");
  const watch = useRef<number | null>(null);
  const last = useRef<GeolocationCoordinates | null>(null);

  useEffect(() => {
    try {
      const r = localStorage.getItem(KEY);
      if (r) setLogs(JSON.parse(r));
    } catch {}
    return () => {
      if (watch.current !== null) navigator.geolocation?.clearWatch(watch.current);
    };
  }, []);

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [run]);

  function start() {
    setRun(true);
    setSec(0);
    setDist(0);
    last.current = null;
    if (navigator.geolocation) {
      watch.current = navigator.geolocation.watchPosition(
        (p) => {
          if (last.current) setDist((d) => d + miles(last.current!, p.coords));
          last.current = p.coords;
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 },
      );
    }
  }

  function stop() {
    setRun(false);
    if (watch.current !== null) {
      navigator.geolocation?.clearWatch(watch.current);
      watch.current = null;
    }
  }

  function save() {
    if (!dist) return;
    const e: Log = {
      id: String(Date.now()),
      date: new Date().toLocaleDateString(),
      activity: a,
      distance: Math.round(dist * 100) / 100,
      duration: sec,
      note: note.trim(),
    };
    const next = [...logs, e].slice(-100);
    setLogs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setNote("");
  }

  const total = useMemo(() => logs.reduce((s, x) => s + x.distance, 0), [logs]);
  const time =
    String(Math.floor(sec / 3600)).padStart(2, "0") +
    ":" +
    String(Math.floor(sec / 60) % 60).padStart(2, "0") +
    ":" +
    String(sec % 60).padStart(2, "0");

  return (
    <main className="hsys" aria-label="Movement">
      <div className="hsys-inner">
        <Link href="/home/health" className="hsys-back">
          <ChevronLeft size={13} /> Health
        </Link>
        <header className="hsys-mast">
          <p className="hsys-k">Movement</p>
          <h1 className="hsys-title">Trails</h1>
          <p className="hsys-sub">Walk, run, or ride. Track the session.</p>
          <div className="hsys-stats">
            <div>
              <strong>{dist ? dist.toFixed(2) : "0.00"}</strong>
              <span>Miles</span>
            </div>
            <div>
              <strong>{time}</strong>
              <span>Time</span>
            </div>
            <div>
              <strong>{total.toFixed(1)}</strong>
              <span>Total</span>
            </div>
          </div>
        </header>

        <section className="hsys-section">
          <p className="hsys-label">Activity</p>
          <div className="hsys-chips">
            {(["Walk", "Run", "Bike"] as Activity[]).map((x) => (
              <button
                key={x}
                type="button"
                className={"hsys-chip" + (a === x ? " on" : "")}
                disabled={run}
                onClick={() => setA(x)}
              >
                {x}
              </button>
            ))}
          </div>
        </section>

        <div className="hsys-actions" style={{ marginTop: "1.25rem" }}>
          {!run ? (
            <button
              type="button"
              className="hsys-btn"
              style={{ marginTop: 0, gridColumn: "1 / -1" }}
              onClick={start}
            >
              Start session
            </button>
          ) : (
            <button
              type="button"
              className="hsys-btn ghost"
              style={{ marginTop: 0, gridColumn: "1 / -1" }}
              onClick={stop}
            >
              Stop
            </button>
          )}
        </div>

        <section className="hsys-section">
          <p className="hsys-label">Log</p>
          <p className="hsys-sub" style={{ marginBottom: "0.5rem" }}>
            GPS runs only while a session is active. Enter distance manually if needed.
          </p>
          <label className="hsys-field">
            <span>Distance · miles</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={dist || ""}
              onChange={(e) => setDist(Number(e.target.value) || 0)}
              disabled={run}
              placeholder="0.00"
            />
          </label>
          <label className="hsys-field">
            <span>Note</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={run}
              placeholder="Route, weather, how it felt"
            />
          </label>
          <button type="button" className="hsys-btn" disabled={!dist || run} onClick={save}>
            Save activity
          </button>
        </section>

        <section className="hsys-section">
          <p className="hsys-label">Record · {logs.length}</p>
          <div className="hsys-list">
            {logs.length === 0 ? (
              <p className="hsys-item-s" style={{ padding: "1rem 0" }}>
                No activities yet.
              </p>
            ) : (
              logs
                .slice(-10)
                .reverse()
                .map((x) => (
                  <div key={x.id} className="hsys-item">
                    <div>
                      <p className="hsys-item-t">
                        {x.activity} · {x.distance.toFixed(2)} mi
                      </p>
                      <p className="hsys-item-s">
                        {x.date}
                        {x.note ? ` · ${x.note}` : ""}
                      </p>
                    </div>
                    <span className="hsys-item-r">{Math.round(x.duration / 60)}m</span>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
