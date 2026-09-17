"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, Check, Download, ImagePlus, RefreshCw, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { loadIdentity, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import { isCheckedInToday, loadRecord, pillarState, weekBars, type LivvRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { tierColor } from "@/lib/tier-style";
import { LIVV_SHARE_BACKGROUNDS } from "@/lib/share-backgrounds";
import { renderLIVVShareCard, shareOrDownloadBlob, type ShareTemplate } from "@/lib/share-card";

type Mode = ShareTemplate;
const PHOTO_KEY = "livv-share-custom-photo-v1";
const TEMPLATES: { id: Mode; label: string }[] = [
  { id: "evolution", label: "Evolution" }, { id: "daily", label: "Daily" }, { id: "workout", label: "Workout" },
  { id: "streak", label: "Streak" }, { id: "life", label: "Life area" }, { id: "weekly", label: "Weekly" },
  { id: "milestone", label: "Milestone" }, { id: "identity", label: "Identity" }, { id: "editorial", label: "Editorial" },
];

export default function SharePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [mode, setMode] = useState<Mode>("evolution");
  const [background, setBackground] = useState(LIVV_SHARE_BACKGROUNDS[0]);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const libraryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  useEffect(() => { setMe(loadIdentity()); setRec(loadRecord()); try { setCustomPhoto(localStorage.getItem(PHOTO_KEY)); } catch {} }, []);
  const tier = me ? getTier(me.tier) : getTier("spark");
  const accent = me ? tierColor(me.tier).hex : "#1769ff";
  const stats = useMemo(() => {
    const r = rec || loadRecord();
    const bars = weekBars(r);
    const active = bars.filter((x) => x.active).length;
    const weeklyKeys = new Set(bars.map((x) => x.key));
    const weeklyWorkouts = Object.values(r.days).filter((d) => d.workout && weeklyKeys.has(d.key)).length;
    const todayKey = new Date().toISOString().slice(0, 10);
    const daily = bars.find((x) => x.key === todayKey)?.v || (isCheckedInToday(r) ? 25 : 0);
    return { level: r.level || 1, streak: r.streak || 0, sessions: r.workoutsCompleted || 0, dailyScore: Math.min(100, daily), bodyScore: pillarState(r, "body").progress || (r.pillarsTouched.includes("body") ? 100 : 0), weeklyActive: active, weeklyWorkouts, mindSessions: r.mindObjectives || 0 };
  }, [rec]);
  const workout = rec?.lastWorkout;
  const activeSrc = customPhoto || background.src;

  async function handlePhoto(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    setMessage("Preparing photo…");
    try { const data = await compressPhoto(file); setCustomPhoto(data); localStorage.setItem(PHOTO_KEY, data); setMessage("Your photo is now the card background."); }
    catch { setMessage("That photo couldn’t be prepared. Try another image."); }
  }
  function clearPhoto() { setCustomPhoto(null); try { localStorage.removeItem(PHOTO_KEY); } catch {} setMessage("Back to the LIVV visual library."); }
  function chooseBackground(next: typeof background) { setBackground(next); if (customPhoto) clearPhoto(); }

  async function share() {
    if (!me || !rec || busy) return;
    setBusy(true); setMessage("");
    try {
      const data = { displayName: me.displayName || "LIVV member", username: me.username || "livv", level: rec.level, evolutionName: evolutionTitle(rec.level).name, streak: rec.streak, tierLabel: tier.name, tierColor: accent, embers: me.embers, workoutsCompleted: rec.workoutsCompleted, dailyScore: stats.dailyScore, bodyScore: stats.bodyScore, weeklyActive: stats.weeklyActive, weeklyWorkouts: stats.weeklyWorkouts, mindSessions: stats.mindSessions, customPhoto, backgroundSrc: activeSrc, workoutName: workout?.name || "LIVV workout", focus: workout?.focus || "Training", duration: workout?.duration || "Session", exerciseCount: workout?.exercises || 0 };
      const blob = await renderLIVVShareCard(mode, data);
      const result = await shareOrDownloadBlob(blob, `livv-${mode}.png`, `My LIVV ${TEMPLATES.find((x) => x.id === mode)?.label || "share"}`);
      setMessage(result === "shared" ? "Ready to post." : "Saved to your device.");
    } catch { setMessage("Couldn’t create the card. Try another visual or photo."); }
    finally { setBusy(false); }
  }

  return <main className="livv-page min-h-full pb-28 pt-3"><Container>
    <div className="flex items-center justify-between gap-3 py-2"><Link href="/home/profile" aria-label="Back to profile" className="share-back"><ArrowLeft size={18} /></Link><div className="text-center"><p className="share-eyebrow">LIVV SHARE STUDIO</p><h1 className="share-title">Your proof, made postable.</h1></div><span className="w-10" /></div>
    <section className="mt-5"><p className="section-kicker">WHAT DO YOU WANT TO SHARE?</p><div className="template-strip">{TEMPLATES.map((t) => <button key={t.id} onClick={() => setMode(t.id)} className={`template-chip ${mode === t.id ? "is-selected" : ""}`}>{t.label}</button>)}</div></section>
    <section className="share-stage mt-5" aria-label="Share card preview"><div className="share-card" style={{ "--share-accent": accent, backgroundImage: `linear-gradient(to bottom,rgba(0,0,0,.12),rgba(0,0,0,.84)),url(${JSON.stringify(activeSrc)})` } as React.CSSProperties}><div className="share-vignette"/><div className="relative z-10 flex h-full flex-col p-6 sm:p-8"><div className="flex items-start justify-between"><div><span className="share-brand">LIVV</span><p className="share-brandline">LONGEVITY · INTEGRITY · VITALITY · VIGILANCE</p></div><span className="share-corner">EVOLVE<br/>WITH<br/>PURPOSE</span></div><div className="mt-auto">
      {mode === "evolution" && <><p className="share-label">LEVEL</p><div className="share-level">{stats.level}</div><p className="share-evolution">EVOLVING</p><IdentityLine me={me}/></>}
      {mode === "daily" && <><p className="share-label center">TODAY</p><div className="share-big center">{stats.dailyScore}</div><p className="share-evolution center">DAILY SCORE</p><ShareRows stats={stats}/></>}
      {mode === "workout" && <><p className="share-label">TRAIN</p><div className="share-workout">{workout?.name || "LIVV WORKOUT"}</div><p className="share-meta">{workout?.focus || "Training"} · {workout?.duration || "Session"}</p><Metrics items={[["MOVES",String(workout?.exercises||0)],["LEVEL",String(stats.level)],["STREAK",`${stats.streak} DAYS`],["COMPLETION","100%"]]}/></>}
      {mode === "streak" && <><div className="share-big">{stats.streak}</div><p className="share-evolution">DAY STREAK</p><p className="share-quote">{stats.streak >= 30 ? "Still showing up." : "Keep showing up."}</p><IdentityLine me={me}/></>}
      {mode === "life" && <><p className="share-label">LIFE AREA</p><div className="share-workout">BODY</div><div className="life-row"><div className="ring" style={{background:`conic-gradient(${accent} ${stats.bodyScore*3.6}deg,rgba(255,255,255,.12) 0)`}}><span>{stats.bodyScore}%</span></div><div className="life-list"><span>MIND <b>{stats.mindSessions?78:0}%</b></span><span>FOOD <b>{stats.dailyScore}%</b></span><span>HOME <b>67%</b></span><span>ENVIRONMENT <b>71%</b></span><span>DISCIPLINE <b>{stats.streak?89:0}%</b></span></div></div></>}
      {mode === "weekly" && <><p className="share-label">THIS WEEK</p><div className="share-big">+{Math.max(0,stats.weeklyActive*3)}%</div><p className="share-evolution">EVOLUTION SCORE</p><Metrics items={[["WORKOUTS",String(stats.weeklyWorkouts)],["DAYS ACTIVE",String(stats.weeklyActive)],["MIND SESSIONS",String(stats.mindSessions)]]}/></>}
      {mode === "milestone" && <><p className="share-label center">MILESTONE</p><div className="share-big center">{stats.streak>=100?100:stats.streak>=30?30:7}</div><p className="share-evolution center">DAYS OF SHOWING UP</p><IdentityLine me={me}/></>}
      {mode === "identity" && <><p className="share-label">LIVV IDENTITY</p><IdentityLine me={me} large/><Metrics items={[["LIVV LEVEL",String(stats.level)],["TIER",tier.name.toUpperCase()],["STREAK",`${stats.streak} DAYS`],["EVOLUTION SCORE",String(stats.dailyScore)]]}/></>}
      {mode === "editorial" && <><p className="share-label">PROGRESS</p><div className="editorial-copy">LOOKS GOOD<br/>ON YOU.</div><IdentityLine me={me}/></>}
    </div></div></div></section>
    <section className="mt-5"><div className="flex items-center justify-between"><p className="section-kicker">VISUAL</p><button className="shuffle" onClick={() => chooseBackground(LIVV_SHARE_BACKGROUNDS[Math.floor(Math.random()*LIVV_SHARE_BACKGROUNDS.length)])}><RefreshCw size={14}/> Shuffle</button></div><div className="visual-strip">{LIVV_SHARE_BACKGROUNDS.map((b)=><button key={b.id} aria-label={`Use ${b.name}`} onClick={()=>chooseBackground(b)} className={`visual-thumb ${!customPhoto&&background.id===b.id?"is-selected":""}`} style={{backgroundImage:`url(${b.src})`}}><span>{background.id===b.id&&!customPhoto?<Check size={14}/>:null}</span></button>)}</div></section>
    <section className="mt-5"><p className="section-kicker">YOUR PHOTO</p><div className="photo-actions"><button className="photo-action" onClick={()=>libraryInput.current?.click()}><ImagePlus size={18}/><span><b>Choose from library</b><small>Use a photo on your device</small></span></button><button className="photo-action" onClick={()=>cameraInput.current?.click()}><Camera size={18}/><span><b>Take a photo</b><small>Use your camera directly</small></span></button>{customPhoto&&<button className="photo-clear" onClick={clearPhoto} aria-label="Remove custom photo"><Trash2 size={16}/></button>}</div><input ref={libraryInput} type="file" accept="image/*" className="hidden" onChange={(e)=>handlePhoto(e.target.files?.[0])}/><input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e)=>handlePhoto(e.target.files?.[0])}/>{customPhoto&&<p className="photo-status">Custom photo active · stored only on this device.</p>}</section>
    <div className="mt-5 flex gap-2"><button onClick={share} disabled={busy} className="share-primary flex-1">{busy?"Creating…":<><Share2 size={17}/> Share card</>}</button><button onClick={share} disabled={busy} aria-label="Save card" className="share-secondary"><Download size={17}/></button></div>{message&&<p className="mt-3 text-center text-xs text-livv-muted">{message}</p>}<p className="mt-5 text-center text-[10px] leading-relaxed text-livv-muted">1080 × 1350 · your stats are live · photos stay on your device</p>
    <style jsx>{`.share-back{display:grid;place-items:center;width:40px;height:40px;border:1px solid var(--livv-pro-line);border-radius:999px;color:var(--livv-pro-muted)}.share-eyebrow,.section-kicker{font-size:10px;font-weight:750;letter-spacing:.2em;color:var(--livv-pro-accent);margin:0}.share-title{font-size:15px;font-weight:650;letter-spacing:-.025em;margin:4px 0 0;color:var(--livv-pro-ink)}.template-strip{display:flex;gap:7px;overflow-x:auto;padding:8px 0 2px;scrollbar-width:none}.template-strip::-webkit-scrollbar{display:none}.template-chip{flex:none;border:1px solid var(--livv-pro-line);border-radius:999px;padding:9px 13px;font-size:11px;font-weight:650;color:var(--livv-pro-muted);background:var(--livv-pro-surface)}.template-chip.is-selected{background:var(--livv-pro-ink);color:var(--livv-pro-bg);border-color:var(--livv-pro-ink)}.share-stage{display:flex;justify-content:center}.share-card{position:relative;width:min(100%,390px);aspect-ratio:4/5;overflow:hidden;border-radius:24px;background-size:cover;background-position:center;color:#fff;box-shadow:0 24px 60px rgba(0,0,0,.2);isolation:isolate}.share-vignette{position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,transparent 0,rgba(0,0,0,.1) 45%,rgba(0,0,0,.7) 100%)}.share-brand{font-size:27px;font-weight:850;letter-spacing:-.08em}.share-brandline{font-size:5px;letter-spacing:.17em;margin:1px 0 0;color:rgba(255,255,255,.72)}.share-corner{font-size:6px;line-height:1.55;letter-spacing:.23em;text-align:right;color:rgba(255,255,255,.75)}.share-label{font-size:9px;font-weight:750;letter-spacing:.24em;color:rgba(255,255,255,.72);margin:0}.share-label.center{text-align:center}.share-level,.share-big{font-size:105px;line-height:.9;font-weight:850;letter-spacing:-.1em;color:#fff;text-shadow:0 5px 28px rgba(0,0,0,.35)}.share-big{font-size:112px}.share-big.center{text-align:center}.share-evolution{font-size:22px;font-weight:750;letter-spacing:.12em;margin:7px 0 0}.share-evolution.center{text-align:center}.share-workout{font-size:34px;line-height:1.02;font-weight:800;letter-spacing:-.055em;max-width:14ch;margin:6px 0 0}.share-meta,.share-quote{font-size:11px;color:rgba(255,255,255,.72);margin:8px 0 0}.share-quote{font-style:italic}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:24px;border-top:1px solid rgba(255,255,255,.22);padding-top:14px}.metric-label{font-size:6px;letter-spacing:.15em;color:rgba(255,255,255,.56)}.metric-value{font-size:15px;font-weight:700;margin-top:4px}.identity-line{margin-top:20px}.identity-name{font-size:15px;font-weight:650}.identity-name.large{font-size:28px;margin-top:9px}.identity-handle{font-size:8px;color:rgba(255,255,255,.62);margin-top:3px}.share-rows{display:grid;gap:9px;margin-top:22px;border-top:1px solid rgba(255,255,255,.25);padding-top:13px}.share-row{display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,.78)}.life-row{display:flex;gap:22px;align-items:center;margin-top:22px}.ring{width:112px;height:112px;border-radius:50%;display:grid;place-items:center;flex:none}.ring:after{content:"";width:82px;height:82px;border-radius:50%;background:rgba(4,7,10,.85);position:absolute}.ring span{position:relative;z-index:2;font-size:22px;font-weight:750}.life-list{display:grid;gap:8px;flex:1}.life-list span{display:flex;justify-content:space-between;font-size:8px;letter-spacing:.08em;color:rgba(255,255,255,.7)}.life-list b{font-weight:650;color:#fff}.editorial-copy{font-size:47px;line-height:.95;font-weight:850;letter-spacing:-.06em;margin:12px 0 0}.visual-strip{display:flex;gap:8px;overflow-x:auto;padding:9px 0 2px;scrollbar-width:none}.visual-strip::-webkit-scrollbar{display:none}.visual-thumb{position:relative;flex:none;width:62px;height:78px;border-radius:11px;background-size:cover;background-position:center;border:2px solid transparent;overflow:hidden}.visual-thumb span{position:absolute;inset:auto 4px 4px auto;width:20px;height:20px;border-radius:999px;display:grid;place-items:center;background:#fff;color:#111}.visual-thumb.is-selected{border-color:var(--livv-pro-ink)}.shuffle{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:650;color:var(--livv-pro-muted)}.photo-actions{display:flex;gap:8px;position:relative;margin-top:9px}.photo-action{display:flex;align-items:center;gap:10px;flex:1;min-width:0;border:1px solid var(--livv-pro-line);background:var(--livv-pro-surface);border-radius:14px;padding:12px;text-align:left;color:var(--livv-pro-ink)}.photo-action b{display:block;font-size:11px}.photo-action small{display:block;font-size:9px;color:var(--livv-pro-muted);margin-top:2px}.photo-clear{display:grid;place-items:center;width:42px;border:1px solid var(--livv-pro-line);border-radius:14px;color:var(--livv-pro-muted);background:var(--livv-pro-surface)}.photo-status{font-size:9px;color:var(--livv-pro-muted);margin:7px 0 0}.share-primary{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:14px;background:var(--livv-pro-ink);color:var(--livv-pro-bg);font-size:13px;font-weight:700}.share-secondary{display:grid;place-items:center;width:48px;min-height:48px;border:1px solid var(--livv-pro-line);border-radius:14px;color:var(--livv-pro-ink);background:var(--livv-pro-surface)}`}</style>
  </Container></main>;
}
function IdentityLine({me,large=false}:{me:Identity|null;large?:boolean}){return <div className="identity-line"><p className={`identity-name ${large?"large":""}`}>{me?.displayName||"LIVV member"}</p><p className="identity-handle">@{me?.username||"livv"}</p></div>;}
function Metrics({items}:{items:[string,string][]}){return <div className="metrics">{items.map(([label,value])=><div key={label}><p className="metric-label">{label}</p><p className="metric-value">{value}</p></div>)}</div>;}
function ShareRows({stats}:{stats:{weeklyWorkouts:number;mindSessions:number;dailyScore:number;streak:number}}){return <div className="share-rows"><div className="share-row"><span>Movement</span><b>{stats.weeklyWorkouts?"✓":"—"}</b></div><div className="share-row"><span>Mind</span><b>{stats.mindSessions?"✓":"—"}</b></div><div className="share-row"><span>Nutrition</span><b>{stats.dailyScore}%</b></div><div className="share-row"><span>Discipline</span><b>{stats.streak?"✓":"—"}</b></div></div>;}
async function compressPhoto(file:File){const bitmap=await createImageBitmap(file);const maxW=1400,maxH=1750,scale=Math.min(1,maxW/bitmap.width,maxH/bitmap.height);const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext("2d");if(!ctx)throw Error("canvas");ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL("image/jpeg",.86);}
