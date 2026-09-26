"use client";

import Link from "next/link";
import { ArrowLeft, Flame, Layers3, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/identity/avatar";
import { loadIdentity, type Identity } from "@/lib/identity";
import { getEffectiveTier } from "@/lib/billing";
import { getTier } from "@/lib/membership";
import { evolutionTitle } from "@/lib/levels";
import { livePillars, loadRecord, weekHitCount, type LivvRecord } from "@/lib/record";
import { buildProgressInsights } from "@/lib/progress-insights";
import { tierColor } from "@/lib/tier-style";
import { LIVV_ICON_WHITE } from "@/lib/header-logo-white";

export default function IdentityCardPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<LivvRecord | null>(null);

  useEffect(() => {
    const sync = () => {
      try {
        setMe(loadIdentity());
        setRec(loadRecord());
      } catch {}
    };
    sync();
    for (const event of ["livv-identity", "livv-record", "livv-billing"]) {
      window.addEventListener(event, sync);
    }
    return () => {
      for (const event of ["livv-identity", "livv-record", "livv-billing"]) {
        window.removeEventListener(event, sync);
      }
    };
  }, []);

  const insights = useMemo(() => rec ? buildProgressInsights(rec, 14) : null, [rec]);

  if (!me || !rec || !insights) {
    return <main className="min-h-dvh bg-black" />;
  }

  const tier = getEffectiveTier();
  const tierDef = getTier(tier);
  const tierStyle = tierColor(tier);
  const evo = evolutionTitle(rec.level);
  const xpNeeded = Math.max(1, rec.xpToNext || 1);
  const xpPct = Math.min(100, Math.round((rec.currentXp / xpNeeded) * 100));
  const pillars = livePillars(rec);
  const activeDays = weekHitCount(rec);

  const stats = [
    { label: "Streak", value: String(rec.streak || 0), suffix: "D", Icon: Flame },
    { label: "Level", value: String(rec.level || 1), suffix: "", Icon: Zap },
    { label: "Workouts", value: String(rec.workoutsCompleted || 0), suffix: "", Icon: DumbbellMark },
    { label: "Embers", value: (me.embers || 0).toLocaleString(), suffix: "", Icon: EmberMark },
  ];

  return (
    <main className="identity-stage">
      <div className="identity-card-shell">
        <Link href="/home/profile" className="identity-close" aria-label="Back to profile">
          <ArrowLeft size={17} />
        </Link>

        <div className="identity-grid" aria-hidden="true" />
        <div className="identity-glow identity-glow-a" aria-hidden="true" />
        <div className="identity-glow identity-glow-b" aria-hidden="true" />
        <div className="identity-wordmark" aria-hidden="true">LIVV</div>

        <header className="identity-top">
          <div className="identity-brand">
            <img src={LIVV_ICON_WHITE} alt="" />
            <span>LIVV</span>
          </div>
          <span className="identity-code">IDENTITY / 001</span>
        </header>

        <section className="identity-person">
          <Avatar identity={{ ...me, tier }} size={92} fit="contain" className="identity-avatar" showTierRing />
          <div className="identity-person-copy">
            <p className="identity-kicker">CURRENT STATE</p>
            <h1>{me.displayName || me.username || "Member"}</h1>
            <p className="identity-handle">@{me.username || "livv"}</p>
          </div>
          <span
            className="identity-tier"
            style={{
              color: tierStyle.hex,
              borderColor: `color-mix(in srgb, ${tierStyle.hex} 55%, transparent)`,
              background: `color-mix(in srgb, ${tierStyle.hex} 12%, transparent)`,
            }}
          >
            {tierDef.name}
          </span>
        </section>

        <section className="identity-status">
          <div>
            <p className="identity-kicker">EVOLUTION STATUS</p>
            <h2>{evo.name}</h2>
            <p>{evo.line}</p>
          </div>
          <div className="identity-level">
            <span>LEVEL</span>
            <strong>{rec.level}</strong>
          </div>
        </section>

        <section className="identity-xp">
          <div className="identity-xp-head">
            <span>XP PROGRESS</span>
            <b>{rec.currentXp.toLocaleString()} / {xpNeeded.toLocaleString()}</b>
          </div>
          <div className="identity-progress-track">
            <span style={{ width: `${xpPct}%` }} />
          </div>
          <div className="identity-xp-foot">
            <span>{xpPct}% toward next level</span>
            <span>{activeDays}/7 active this week</span>
          </div>
        </section>

        <section className="identity-stats">
          {stats.map(({ label, value, suffix, Icon }) => (
            <div className="identity-stat" key={label}>
              <Icon />
              <strong>{value}{suffix}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="identity-record">
          <div className="identity-record-head">
            <div>
              <p className="identity-kicker">THE RECORD</p>
              <h3>How you're moving.</h3>
            </div>
            <span>{insights.consistencyPct}% / 14D</span>
          </div>

          <div className="identity-mini-stats">
            <MiniStat label="Actions" value={String(insights.objectivesCompletedInWindow)} />
            <MiniStat label="Best run" value={`${insights.longestActiveRun}d`} />
            <MiniStat label="Areas" value={`${Math.round(insights.balancePct)}%`} />
          </div>

          <div className="identity-pillars">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="identity-pillar">
                <div>
                  <span>{pillar.name}</span>
                  <b>{pillar.progress}%</b>
                </div>
                <div className="identity-pillar-track">
                  <span style={{ width: `${Math.min(100, pillar.progress)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="identity-footer">
          <span>LONGEVITY · INTEGRITY · VITALITY · VIGILANCE</span>
          <b>EVOLVE WITH PURPOSE.</b>
        </footer>
      </div>
    
<style jsx>{`
  .identity-stage{position:fixed;inset:0;z-index:100;overflow:auto;background:#060709;color:#f7f7f4;padding:calc(12px + env(safe-area-inset-top)) 14px calc(18px + env(safe-area-inset-bottom));}
  .identity-card-shell{position:relative;isolation:isolate;overflow:hidden;width:min(100%,430px);min-height:calc(100dvh - 30px);margin:0 auto;border:1px solid rgba(255,255,255,.13);border-radius:30px;background:linear-gradient(145deg,#111318 0%,#090a0d 58%,#0d1015 100%);box-shadow:0 30px 80px rgba(0,0,0,.5);padding:22px 20px 18px;}
  .identity-grid{position:absolute;inset:0;z-index:-2;opacity:.28;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:34px 34px;mask-image:linear-gradient(to bottom,black 0%,transparent 88%);}
  .identity-glow{position:absolute;z-index:-1;border-radius:999px;filter:blur(30px);pointer-events:none}.identity-glow-a{width:230px;height:230px;right:-95px;top:-65px;background:rgba(23,105,255,.23)}.identity-glow-b{width:190px;height:190px;left:-105px;bottom:130px;background:rgba(215,255,63,.06)}
  .identity-wordmark{position:absolute;right:-14px;top:72px;font-size:104px;line-height:.8;font-weight:900;letter-spacing:-.09em;color:rgba(255,255,255,.025);pointer-events:none}
  .identity-close{position:absolute;top:18px;left:18px;z-index:4;width:38px;height:38px;border:1px solid rgba(255,255,255,.14);border-radius:999px;display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.045);backdrop-filter:blur(10px)}
  .identity-top{display:flex;align-items:center;justify-content:space-between;padding-left:50px}.identity-brand{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:800;letter-spacing:.14em}.identity-brand img{width:18px;height:18px;object-fit:contain}.identity-code{font-size:8px;letter-spacing:.18em;color:rgba(255,255,255,.42)}
  .identity-person{position:relative;display:grid;grid-template-columns:92px 1fr;gap:14px;align-items:center;margin-top:34px;padding:18px;border:1px solid rgba(255,255,255,.10);border-radius:22px;background:rgba(255,255,255,.045)}.identity-avatar{background:#15171b}.identity-person-copy{min-width:0}.identity-kicker{margin:0;color:rgba(255,255,255,.42);font-size:8px;font-weight:800;letter-spacing:.2em}.identity-person h1{margin:5px 0 0;font-size:23px;line-height:1.05;letter-spacing:-.045em}.identity-handle{margin:5px 0 0;color:rgba(255,255,255,.48);font-size:10px}.identity-tier{position:absolute;right:13px;top:13px;padding:5px 8px;border:1px solid;border-radius:999px;font-size:7px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}
  .identity-status{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;padding:22px 2px 18px;border-bottom:1px solid rgba(255,255,255,.09)}.identity-status h2{margin:5px 0 0;font-size:31px;letter-spacing:-.055em;line-height:1}.identity-status p:last-child{margin:7px 0 0;max-width:27ch;color:rgba(255,255,255,.5);font-size:9px;line-height:1.45}.identity-level{text-align:right}.identity-level span{display:block;color:rgba(255,255,255,.35);font-size:7px;font-weight:800;letter-spacing:.18em}.identity-level strong{display:block;margin-top:2px;font-size:36px;line-height:1;font-variant-numeric:tabular-nums}
  .identity-xp{padding:15px 2px 16px;border-bottom:1px solid rgba(255,255,255,.09)}.identity-xp-head,.identity-xp-foot{display:flex;justify-content:space-between;gap:10px;align-items:center}.identity-xp-head{color:rgba(255,255,255,.43);font-size:7px;font-weight:800;letter-spacing:.18em}.identity-xp-head b{color:rgba(255,255,255,.65);font-size:8px;letter-spacing:.04em}.identity-progress-track{height:5px;margin:9px 0 7px;overflow:hidden;border-radius:999px;background:rgba(255,255,255,.10)}.identity-progress-track span{display:block;height:100%;border-radius:inherit;background:#1769ff;box-shadow:0 0 18px rgba(23,105,255,.55)}.identity-xp-foot{color:rgba(255,255,255,.34);font-size:7px}
  .identity-stats{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid rgba(255,255,255,.09)}.identity-stat{min-width:0;padding:15px 4px 14px;text-align:center;border-right:1px solid rgba(255,255,255,.08)}.identity-stat:last-child{border-right:0}.identity-stat svg{width:14px;height:14px;margin:0 auto 7px;color:rgba(255,255,255,.38)}.identity-stat strong{display:block;font-size:17px;line-height:1;font-variant-numeric:tabular-nums}.identity-stat span{display:block;margin-top:5px;color:rgba(255,255,255,.35);font-size:7px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.identity-ember-mark{display:grid;place-items:center;width:14px;height:14px;margin:0 auto 7px;color:#d7ff3f;font-size:13px}
  .identity-record{padding-top:17px}.identity-record-head{display:flex;align-items:end;justify-content:space-between;gap:12px}.identity-record-head h3{margin:4px 0 0;font-size:18px;letter-spacing:-.035em}.identity-record-head>span{color:rgba(255,255,255,.4);font-size:8px;font-weight:800;letter-spacing:.12em}.identity-mini-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:12px}.identity-mini-stats>div{padding:10px 10px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.035)}.identity-mini-stats strong{display:block;font-size:15px}.identity-mini-stats span{display:block;margin-top:3px;color:rgba(255,255,255,.38);font-size:7px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
  .identity-pillars{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;margin-top:15px}.identity-pillar>div:first-child{display:flex;justify-content:space-between;gap:8px;color:rgba(255,255,255,.54);font-size:7px;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.identity-pillar b{color:rgba(255,255,255,.78);font-size:8px}.identity-pillar-track{height:3px;margin-top:5px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.08)}.identity-pillar-track span{display:block;height:100%;border-radius:inherit;background:rgba(255,255,255,.7)}
  .identity-footer{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-top:18px;padding-top:12px;border-top:1px solid rgba(255,255,255,.09);color:rgba(255,255,255,.28);font-size:6px;font-weight:800;letter-spacing:.14em}.identity-footer b{color:rgba(255,255,255,.55);font-size:7px;white-space:nowrap}
  @media(max-height:760px){.identity-card-shell{padding-top:18px}.identity-person{margin-top:25px;padding:14px}.identity-status{padding:16px 2px 13px}.identity-status h2{font-size:27px}.identity-xp{padding:11px 2px}.identity-stat{padding:12px 3px}.identity-record{padding-top:13px}.identity-mini-stats{margin-top:9px}.identity-pillars{margin-top:11px;gap:7px 12px}.identity-footer{margin-top:12px;padding-top:9px}}
  @media(min-width:700px){.identity-stage{padding-top:28px}.identity-card-shell{min-height:0;max-height:calc(100dvh - 56px)}}
`}</style>

</main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function DumbbellMark() {
  return <Layers3 />;
}

function EmberMark() {
  return <span className="identity-ember-mark" aria-hidden="true">✦</span>;
}
 