"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Camera, Check, ChevronDown, Download, ImagePlus, RefreshCw, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { loadIdentity, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import { isCheckedInToday, loadRecord, pillarState, weekBars, type LivvRecord } from "@/lib/record";
import { LIVV_SHARE_BACKGROUNDS } from "@/lib/share-backgrounds";
import {
  renderLIVVShareCard,
  shareOrDownloadBlob,
  type ShareCardData,
  type ShareFont,
  type ShareLogo,
  type ShareTemplate,
} from "@/lib/share-card";

const T: [ShareTemplate, string][] = [
  ["evolution", "Evolution"], ["daily", "Daily"], ["workout", "Workout"],
  ["streak", "Streak"], ["life", "Life area"], ["weekly", "Weekly"],
  ["milestone", "Milestone"], ["identity", "Identity"], ["editorial", "Editorial"],
];
const F: [ShareFont, string][] = [["sans", "Clean"], ["display", "Bold"], ["mono", "Mono"], ["serif", "Editorial"]];
const C = ["#FFFFFF", "#111111", "#1769FF", "#D7FF3F", "#FFB84D"];
const PHOTO_KEY = "livv-share-custom-photo-v1";

export default function SharePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [mode, setMode] = useState<ShareTemplate>("evolution");
  const [bg, setBg] = useState(LIVV_SHARE_BACKGROUNDS[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [font, setFont] = useState<ShareFont>("sans");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [logo, setLogo] = useState<ShareLogo>("auto");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [visualOpen, setVisualOpen] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMe(loadIdentity());
    setRec(loadRecord());
    try { setPhoto(localStorage.getItem(PHOTO_KEY)); } catch {}
  }, []);

  const tier = me ? getTier(me.tier) : getTier("spark");
  const stats = useMemo(() => {
    const r = rec || loadRecord();
    const bars = weekBars(r);
    const today = new Date().toISOString().slice(0, 10);
    const keys = new Set(bars.map((x) => x.key));
    return {
      level: r.level || 1,
      streak: r.streak || 0,
      sessions: r.workoutsCompleted || 0,
      daily: Math.min(100, bars.find((x) => x.key === today)?.v || (isCheckedInToday(r) ? 25 : 0)),
      body: pillarState(r, "body").progress || (r.pillarsTouched.includes("body") ? 100 : 0),
      active: bars.filter((x) => x.active).length,
      weekly: Object.values(r.days).filter((d) => d.workout && keys.has(d.key)).length,
      mind: r.mindObjectives || 0,
    };
  }, [rec]);

  const workout = rec?.lastWorkout;
  const src = photo || bg.src;

  const data = useMemo<ShareCardData>(() => ({
    displayName: me?.displayName || "LIVV member",
    username: me?.username || "livv",
    level: stats.level,
    evolutionName: "Evolving",
    streak: stats.streak,
    tierLabel: tier.name,
    tierColor: "#1769FF",
    embers: me?.embers || 0,
    workoutsCompleted: stats.sessions,
    dailyScore: stats.daily,
    bodyScore: stats.body,
    weeklyActive: stats.active,
    weeklyWorkouts: stats.weekly,
    mindSessions: stats.mind,
    customPhoto: photo,
    backgroundSrc: src,
    workoutName: workout?.name || "LIVV WORKOUT",
    focus: workout?.focus || "Training",
    duration: workout?.duration || "Session",
    exerciseCount: workout?.exercises || 0,
    font,
    textColor,
    logo,
  }), [me, stats, tier.name, photo, src, workout, font, textColor, logo]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    (async () => {
      try {
        const blob = await renderLIVVShareCard(mode, data);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) setPreviewUrl("");
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mode, data]);

  async function choosePhoto(file?: File) {
    if (!file?.type.startsWith("image/")) return;
    try {
      const compressed = await compress(file);
      setPhoto(compressed);
      localStorage.setItem(PHOTO_KEY, compressed);
      setMsg("Custom photo active.");
    } catch {
      setMsg("Couldn’t prepare that photo.");
    }
  }

  function clearPhoto() {
    setPhoto(null);
    try { localStorage.removeItem(PHOTO_KEY); } catch {}
    setMsg("Back to the LIVV library.");
  }

  async function share() {
    if (!me || !rec || busy) return;
    setBusy(true);
    try {
      const blob = await renderLIVVShareCard(mode, data);
      const result = await shareOrDownloadBlob(blob, `livv-${mode}.png`, `My LIVV ${T.find((x) => x[0] === mode)?.[1] || "card"}`);
      setMsg(result === "shared" ? "Ready to post." : "Saved to your device.");
    } catch {
      setMsg("Couldn’t create the card.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="livv-page share-studio">
      <Container>
        <header className="share-header">
          <Link href="/home/profile" className="share-back" aria-label="Back to profile"><ArrowLeft size={18} /></Link>
          <div className="share-heading">
            <p className="share-eyebrow">LIVV SHARE STUDIO</p>
            <h1>Your proof, made postable.</h1>
          </div>
          <span className="share-header-spacer" />
        </header>

        <section className="share-section share-types">
          <p className="share-label">CARD</p>
          <div className="share-type-scroll">
            {T.map(([id, label]) => (
              <button key={id} className={mode === id ? "share-pill active" : "share-pill"} onClick={() => setMode(id)}>
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="share-preview-section" aria-label="Share card preview">
          <div className="share-preview-frame">
            {previewUrl ? (
              <img src={previewUrl} alt="LIVV share card preview" className="share-preview-image" />
            ) : (
              <div className="share-preview-loading">Preparing your card…</div>
            )}
          </div>
        </section>

        <section className="share-section">
          <button className="share-disclosure" onClick={() => setCustomOpen((v) => !v)}>
            <span><b>Customize</b><small>Typeface, text color and logo</small></span>
            <ChevronDown size={18} className={customOpen ? "rotate" : ""} />
          </button>
          {customOpen && (
            <div className="share-custom-panel">
              <OptionGroup label="TYPEFACE">
                <div className="share-option-row">{F.map(([id, label]) => <button key={id} className={font === id ? "share-option active" : "share-option"} onClick={() => setFont(id)}>{label}</button>)}</div>
              </OptionGroup>
              <OptionGroup label="TEXT COLOR">
                <div className="share-option-row">{C.map((color) => <button key={color} aria-label={`Text color ${color}`} className={textColor === color ? "share-color active" : "share-color"} style={{ background: color }} onClick={() => setTextColor(color)} />)}</div>
              </OptionGroup>
              <OptionGroup label="PILLARS LOGO">
                <div className="share-option-row">
                  {(["auto", "white", "black"] as ShareLogo[]).map((value) => (
                    <button key={value} className={logo === value ? "share-option active" : "share-option"} onClick={() => setLogo(value)}>
                      {value === "auto" ? "Auto" : value === "white" ? "White" : "Black"}
                    </button>
                  ))}
                </div>
              </OptionGroup>
            </div>
          )}
        </section>

        <section className="share-section">
          <button className="share-disclosure" onClick={() => setVisualOpen((v) => !v)}>
            <span><b>Visual</b><small>{photo ? "Your photo" : "LIVV background library"}</small></span>
            <ChevronDown size={18} className={visualOpen ? "rotate" : ""} />
          </button>
          {visualOpen && (
            <div className="share-visual-panel">
              <div className="share-visual-head">
                <span>BACKGROUND</span>
                <button className="share-shuffle" onClick={() => setBg(LIVV_SHARE_BACKGROUNDS[Math.floor(Math.random() * LIVV_SHARE_BACKGROUNDS.length)])}><RefreshCw size={14} /> Shuffle</button>
              </div>
              <div className="share-visuals">
                {LIVV_SHARE_BACKGROUNDS.map((item) => (
                  <button key={item.id} aria-label={`Use ${item.id} background`} onClick={() => { setBg(item); setPhoto(null); }} className={!photo && bg.id === item.id ? "share-thumb active" : "share-thumb"} style={{ backgroundImage: `url("${item.src}")` }}>
                    {!photo && bg.id === item.id && <Check size={15} />}
                  </button>
                ))}
              </div>
              <div className="share-photo-actions">
                <button onClick={() => input.current?.click()}><ImagePlus size={17} /> Choose photo</button>
                <button onClick={() => camera.current?.click()}><Camera size={17} /> Camera</button>
                {photo && <button className="icon-only" onClick={clearPhoto} aria-label="Remove custom photo"><Trash2 size={17} /></button>}
              </div>
              <input ref={input} className="hidden" type="file" accept="image/*" onChange={(e) => choosePhoto(e.target.files?.[0])} />
              <input ref={camera} className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => choosePhoto(e.target.files?.[0])} />
            </div>
          )}
        </section>

        <div className="share-actions">
          <button className="share-primary" disabled={busy || !previewUrl} onClick={share}>{busy ? "Creating…" : <><Share2 size={17} /> Share card</>}</button>
          <button className="share-secondary" disabled={busy || !previewUrl} onClick={share} aria-label="Save card"><Download size={18} /></button>
        </div>
        {msg && <p className="share-message">{msg}</p>}
        <p className="share-foot">1080 × 1350 · what you see is what you share</p>

        <style jsx>{`
          .share-studio{padding:10px 0 7rem}
          .share-header{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:10px;padding:4px 0 18px}
          .share-back{width:40px;height:40px;border:1px solid var(--livv-pro-line);border-radius:999px;display:grid;place-items:center;color:var(--livv-pro-ink);background:var(--livv-pro-surface)}
          .share-heading{text-align:center}.share-eyebrow,.share-label,.share-visual-head>span{font-size:10px;font-weight:750;letter-spacing:.18em;color:var(--livv-pro-accent);margin:0}.share-heading h1{font-size:16px;font-weight:650;letter-spacing:-.035em;margin:4px 0 0;color:var(--livv-pro-ink)!important}
          .share-preview-section{display:flex;justify-content:center;padding:4px 0 20px}
          .share-preview-frame{width:min(100%,390px);aspect-ratio:4/5;overflow:hidden;border-radius:22px;background:#0b0c0f;box-shadow:0 18px 45px rgba(0,0,0,.16)}
          .share-preview-image{display:block;width:100%;height:100%;object-fit:cover}
          .share-preview-loading{width:100%;height:100%;display:grid;place-items:center;color:#aaa;font-size:12px}
          .share-section{border-top:1px solid var(--livv-pro-line);padding:15px 0 0;margin-top:2px}
          .share-types{border-top:0;padding-top:0}.share-type-scroll{display:flex;gap:7px;overflow-x:auto;padding:9px 0 4px;scrollbar-width:none}.share-type-scroll::-webkit-scrollbar,.share-visuals::-webkit-scrollbar{display:none}
          .share-pill,.share-option{flex:none;border:1px solid var(--livv-pro-line);background:var(--livv-pro-surface);color:var(--livv-pro-muted);border-radius:999px;padding:9px 13px;font-size:11px;font-weight:650;min-height:40px}.share-pill.active,.share-option.active{background:var(--livv-pro-ink);color:var(--livv-pro-bg);border-color:var(--livv-pro-ink)}
          .share-disclosure{width:100%;display:flex;justify-content:space-between;align-items:center;text-align:left;background:transparent;color:var(--livv-pro-ink);padding:2px 0 14px;border:0;min-height:44px}.share-disclosure span{display:flex;flex-direction:column;gap:3px}.share-disclosure b{font-size:13px;font-weight:700}.share-disclosure small{font-size:11px;color:var(--livv-pro-muted)}.share-disclosure svg{color:var(--livv-pro-muted);transition:transform .18s}.share-disclosure .rotate{transform:rotate(180deg)}
          .share-custom-panel{padding:2px 0 5px}.share-custom-panel>div+div{margin-top:15px}.share-label{margin-bottom:7px}.share-option-row{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none}.share-color{width:32px;height:32px;min-width:32px;border-radius:50%;border:2px solid transparent;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}.share-color.active{border-color:var(--livv-pro-ink);box-shadow:inset 0 0 0 3px var(--livv-pro-surface)}
          .share-visual-panel{padding-bottom:3px}.share-visual-head{display:flex;justify-content:space-between;align-items:center}.share-shuffle{display:flex;align-items:center;gap:5px;color:var(--livv-pro-muted);font-size:11px;font-weight:650;border:0;background:transparent}.share-visuals{display:flex;gap:8px;overflow-x:auto;padding:10px 0 12px;scrollbar-width:none}.share-thumb{width:58px;height:72px;min-width:58px;border-radius:11px;background-size:cover;background-position:center;border:2px solid transparent;display:grid;place-items:center;color:#fff}.share-thumb.active{border-color:var(--livv-pro-ink)}
          .share-photo-actions{display:flex;gap:7px}.share-photo-actions button{display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--livv-pro-line);background:var(--livv-pro-surface);color:var(--livv-pro-ink);border-radius:12px;padding:11px 12px;font-size:11px;font-weight:650;min-height:44px}.share-photo-actions .icon-only{width:44px;padding:0}
          .share-actions{display:flex;gap:8px;margin-top:18px}.share-primary,.share-secondary{border-radius:14px;min-height:48px;display:flex;align-items:center;justify-content:center;gap:7px;font-weight:700;border:1px solid var(--livv-pro-line)}.share-primary{flex:1;background:var(--livv-pro-ink);color:var(--livv-pro-bg);border-color:var(--livv-pro-ink)}.share-secondary{width:48px;background:var(--livv-pro-surface);color:var(--livv-pro-ink)}.share-primary:disabled,.share-secondary:disabled{opacity:.5}
          .share-message{text-align:center;font-size:11px;color:var(--livv-pro-muted);margin:10px 0 0}.share-foot{text-align:center;color:var(--livv-pro-muted);font-size:10px;margin:12px 0 0}
          @media(min-width:768px){.share-studio{max-width:42rem;margin-inline:auto}.share-preview-frame{width:390px}}
        `}</style>
      </Container>
    </main>
  );
}

function OptionGroup({ label, children }: { label: string; children: ReactNode }) {
  return <div><p className="share-label">{label}</p>{children}</div>;
}

async function compress(file: File) {
  const bytes = await file.arrayBuffer();
  const url = URL.createObjectURL(new Blob([bytes], { type: file.type }));
  const image = new Image();
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject; image.src = url; });
  const max = 1800;
  const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  return canvas.toDataURL("image/jpeg", .88);
}
