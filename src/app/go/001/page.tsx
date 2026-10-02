"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const pillars = [
  ["LONGEVITY", "Build a body and life that can carry you further."],
  ["INTEGRITY", "Make your actions line up with what you say matters."],
  ["VITALITY", "Protect the energy, health, and presence that make life feel alive."],
  ["VIGILANCE", "Stay aware, prepared, and capable when life gets real."],
] as const;

export default function FieldNote001() {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.dataset.livvRoute = "field-note-001";
    return () => delete document.documentElement.dataset.livvRoute;
  }, []);

  const next = () => {
    setOpen(null);
    setStage((s) => Math.min(2, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="field-note" aria-label="LIVV Field Note 001">
      <div className="fn-noise" aria-hidden="true" />
      <div className="fn-stars" aria-hidden="true" />
      <div className="fn-halo" aria-hidden="true" />

      <header className="fn-header">
        <a href="/" className="fn-brand" aria-label="LIVV home">
          <img src="/livv-logo.png" alt="LIVV" />
        </a>
        <span className="fn-code">FIELD NOTE / 001</span>
      </header>

      <div className="fn-stage">
        {stage === 0 && (
          <section className="fn-screen fn-hero">
            <div className="fn-sigil" aria-hidden="true">
              <div className="fn-orbit fn-orbit-a" />
              <div className="fn-orbit fn-orbit-b" />
              <div className="fn-orbit fn-orbit-c" />
              <div className="fn-sigil-core">
                <img src="/livv-logo.png" alt="" />
              </div>
              <i className="fn-dot fn-dot-a" />
              <i className="fn-dot fn-dot-b" />
            </div>

            <p className="fn-kicker"><span /> YOU FOUND IT <span /></p>
            <h1>Something is<em>waiting for you.</em></h1>
            <p className="fn-lede">No ad. No pitch. Just a doorway into a different way of living.</p>

            <button className="fn-cta" onClick={next}>
              <span>OPEN FIELD NOTE 001</span>
              <b>↗</b>
            </button>
            <p className="fn-micro">TAP TO CONTINUE</p>
          </section>
        )}

        {stage === 1 && (
          <section className="fn-screen fn-idea">
            <div className="fn-meta"><span>01 / 03</span><span><i /> LIVE NOTE</span></div>
            <p className="fn-kicker fn-kicker-left">THE IDEA</p>
            <h2>You are not here<em>just to survive.</em></h2>
            <p className="fn-lede fn-left">What happens when becoming more capable becomes part of everyday life?</p>

            <div className="fn-pillars">
              {pillars.map(([title, text], index) => {
                const active = open === index;
                return (
                  <button
                    key={title}
                    className={"fn-pillar" + (active ? " active" : "")}
                    onClick={() => setOpen(active ? null : index)}
                    aria-expanded={active}
                  >
                    <span className="fn-num">0{index + 1}</span>
                    <span className="fn-pillar-copy">
                      <strong>{title}</strong>
                      <small>{active ? text : "TAP TO REVEAL"}</small>
                    </span>
                    <span className="fn-plus">{active ? "−" : "+"}</span>
                    <span className="fn-sweep" aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            <button className="fn-cta" onClick={next}>
              <span>SEE THE SYSTEM</span><b>↗</b>
            </button>
          </section>
        )}

        {stage === 2 && (
          <section className="fn-screen fn-final">
            <div className="fn-final-mark" aria-hidden="true">
              <span /><div><img src="/livv-logo.png" alt="" /></div><span />
            </div>
            <p className="fn-kicker fn-kicker-left">WELCOME TO LIVV</p>
            <h2>Evolve<em>with purpose.</em></h2>
            <p className="fn-lede fn-left">Training. Health. Knowledge. Practical capability. The small things that compound into a life you can actually live.</p>

            <button className="fn-next" onClick={() => router.push("/auth")}>
              <span><small>THE NEXT MOVE</small><strong>Enter LIVV.</strong></span>
              <b>↗</b>
            </button>
            <button className="fn-text" onClick={() => router.push("/")}>EXPLORE THE SITE</button>

            <div className="fn-signoff">
              <img src="/livv-logo.png" alt="LIVV" />
              <span>EVOLVE WITH PURPOSE.</span>
            </div>
          </section>
        )}
      </div>

      <footer className="fn-footer">
        <div className="fn-progress">{[0,1,2].map((n) => <span key={n} className={n === stage ? "active" : ""} />)}</div>
        <span>{stage === 0 ? "TAP / SCAN / DISCOVER" : stage === 1 ? "EXPLORE THE PILLARS" : "FIELD NOTE / 001"}</span>
      </footer>

      <style jsx>{`
        .field-note{--bg:#050607;--ink:#f3f1ec;--muted:rgba(243,241,236,.55);--line:rgba(243,241,236,.13);--accent:#a8caff;position:relative;min-height:100svh;overflow:hidden;isolation:isolate;background:radial-gradient(circle at 50% 42%,rgba(91,132,191,.13),transparent 34%),radial-gradient(circle at 50% 100%,rgba(255,255,255,.04),transparent 45%),var(--bg);color:var(--ink);font-family:var(--font-body),sans-serif}
        .fn-noise{position:absolute;inset:-60%;pointer-events:none;opacity:.045;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");transform:rotate(8deg);z-index:20}
        .fn-stars{position:absolute;inset:0;opacity:.22;pointer-events:none;background-image:radial-gradient(circle,rgba(255,255,255,.7) 0 1px,transparent 1.5px);background-size:97px 113px;mask-image:radial-gradient(circle at 50% 40%,black,transparent 65%);animation:drift 24s linear infinite}
        .fn-halo{position:absolute;width:min(90vw,620px);aspect-ratio:1;left:50%;top:43%;transform:translate(-50%,-50%);border-radius:50%;background:rgba(103,151,224,.08);filter:blur(65px);animation:breathe 5s ease-in-out infinite;pointer-events:none}
        @keyframes breathe{50%{transform:translate(-50%,-50%) scale(1.12);opacity:.75}}@keyframes drift{to{background-position:97px 113px}}
        .fn-header,.fn-footer{position:relative;z-index:30;width:min(calc(100% - 40px),680px);margin:auto;display:flex;align-items:center;justify-content:space-between}
        .fn-header{padding-top:max(22px,env(safe-area-inset-top))}.fn-brand{width:78px;line-height:0}.fn-brand img,.fn-signoff img{width:100%;height:auto;display:block;filter:brightness(0) invert(1)}
        .fn-code,.fn-footer{font-size:8px;font-weight:800;letter-spacing:.18em;color:var(--muted)}
        .fn-stage{position:relative;z-index:25;width:min(calc(100% - 40px),680px);min-height:calc(100svh - 126px);margin:auto;display:flex;align-items:center;padding:45px 0 65px;box-sizing:border-box}
        .fn-screen{width:100%;animation:enter .8s cubic-bezier(.2,.9,.2,1)}@keyframes enter{from{opacity:0;transform:translateY(24px) scale(.985);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
        .fn-hero{text-align:center}.fn-sigil{position:relative;width:min(78vw,360px);aspect-ratio:1;margin:0 auto 25px;display:grid;place-items:center}
        .fn-orbit{position:absolute;border:1px solid rgba(208,226,250,.13);border-radius:50%;inset:0}.fn-orbit-a{border-top-color:rgba(208,226,250,.8);animation:spin 14s linear infinite}.fn-orbit-b{inset:12%;border-style:dashed;transform:rotate(40deg);animation:spinr 21s linear infinite}.fn-orbit-c{inset:25%;border-color:rgba(208,226,250,.08);animation:pulse 4s ease-in-out infinite}
        .fn-sigil-core{width:45%;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(255,255,255,.18);background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.13),transparent 65%);box-shadow:0 0 90px rgba(111,158,225,.18),inset 0 0 40px rgba(255,255,255,.04);backdrop-filter:blur(12px);animation:float 5s ease-in-out infinite}.fn-sigil-core img{width:62%;filter:brightness(0) invert(1)}
        .fn-dot{position:absolute;width:6px;height:6px;border-radius:50%;background:#c4dcff;box-shadow:0 0 18px #b3d1ff}.fn-dot-a{top:15%;left:19%;animation:dot 4s ease-in-out infinite}.fn-dot-b{right:11%;bottom:22%;animation:dot 3.2s ease-in-out infinite reverse}
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes spinr{to{transform:rotate(-360deg)}}@keyframes pulse{50%{transform:scale(1.05);opacity:.7}}@keyframes float{50%{transform:translateY(-8px)}}@keyframes dot{50%{transform:translate(8px,-10px);opacity:.35}}
        .fn-kicker{display:flex;justify-content:center;align-items:center;gap:10px;margin:0 0 18px;color:var(--accent);font-size:9px;font-weight:800;letter-spacing:.22em}.fn-kicker span{width:25px;height:1px;background:currentColor;opacity:.5}.fn-kicker-left{justify-content:flex-start}
        h1,h2{margin:0;font-family:var(--font-display),sans-serif;font-weight:600;letter-spacing:-.065em;line-height:.91}h1{font-size:clamp(54px,15vw,88px)}h2{font-size:clamp(49px,13vw,80px)}h1 em,h2 em{display:block;color:rgba(243,241,236,.38);font-style:normal}
        .fn-lede{max-width:480px;margin:24px auto 0;color:var(--muted);font-size:14px;line-height:1.7}.fn-left{margin-left:0}
        .fn-cta{position:relative;overflow:hidden;width:100%;min-height:62px;margin-top:34px;padding:0 20px 0 22px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(255,255,255,.2);border-radius:18px;background:#f1efe9;color:#070809;font:800 10px/1 var(--font-body),sans-serif;letter-spacing:.15em;cursor:pointer;box-shadow:0 18px 55px rgba(0,0,0,.35);transition:transform .25s,box-shadow .25s}.fn-cta:after{content:"";position:absolute;inset:0;transform:translateX(-120%);background:linear-gradient(100deg,transparent,rgba(255,255,255,.8),transparent);transition:transform .7s}.fn-cta:hover:after{transform:translateX(120%)}.fn-cta:hover{transform:translateY(-3px);box-shadow:0 25px 70px rgba(0,0,0,.45)}.fn-cta span,.fn-cta b{position:relative;z-index:1}.fn-cta b{font-size:19px}.fn-micro{text-transform:uppercase;margin:15px 0 0;color:rgba(243,241,236,.3);font-size:8px;font-weight:800;letter-spacing:.18em}
        .fn-meta{display:flex;justify-content:space-between;margin-bottom:46px;color:var(--muted);font-size:8px;font-weight:800;letter-spacing:.18em}.fn-meta span:last-child{display:flex;align-items:center;gap:7px}.fn-meta i{width:5px;height:5px;border-radius:50%;background:#b9d5ff;box-shadow:0 0 12px #b9d5ff;animation:blink 1.8s infinite}@keyframes blink{50%{opacity:.25}}
        .fn-pillars{margin-top:34px;border-top:1px solid var(--line)}.fn-pillar{position:relative;overflow:hidden;width:100%;min-height:76px;display:grid;grid-template-columns:38px 1fr 24px;align-items:center;gap:12px;padding:0;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--ink);text-align:left;cursor:pointer;transition:min-height .4s ease}.fn-pillar.active{min-height:112px}.fn-num{color:rgba(243,241,236,.3);font-size:9px;letter-spacing:.12em}.fn-pillar-copy{display:flex;flex-direction:column;gap:7px;position:relative;z-index:2}.fn-pillar-copy strong{font-size:12px;letter-spacing:.18em}.fn-pillar-copy small{color:var(--muted);font-size:11px;line-height:1.5}.fn-plus{position:relative;z-index:2;color:var(--muted);font-size:19px;text-align:right}.fn-pillar.active .fn-plus{color:var(--accent)}.fn-sweep{position:absolute;inset:0;transform:translateX(-110%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.045),transparent)}.fn-pillar:active .fn-sweep{animation:sweep .55s ease}@keyframes sweep{to{transform:translateX(110%)}}
        .fn-final-mark{display:flex;align-items:center;gap:15px;margin-bottom:34px}.fn-final-mark span{height:1px;flex:1;background:linear-gradient(90deg,transparent,var(--line))}.fn-final-mark span:last-child{transform:scaleX(-1)}.fn-final-mark div{width:72px;height:72px;border:1px solid rgba(255,255,255,.18);border-radius:22px;display:grid;place-items:center;background:rgba(255,255,255,.035);box-shadow:0 0 55px rgba(110,155,220,.12)}.fn-final-mark img{width:58%;filter:brightness(0) invert(1)}
        .fn-next{width:100%;margin-top:31px;padding:17px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(255,255,255,.035);color:var(--ink);text-align:left;backdrop-filter:blur(18px);cursor:pointer}.fn-next span{display:flex;flex-direction:column;gap:7px}.fn-next small{font-size:8px;font-weight:800;letter-spacing:.18em;color:var(--muted)}.fn-next strong{font-family:var(--font-display),sans-serif;font-size:22px;letter-spacing:-.04em}.fn-next b{width:52px;height:52px;display:grid;place-items:center;border-radius:16px;background:var(--ink);color:#070809;font-size:20px;transition:transform .2s}.fn-next:hover b{transform:rotate(8deg) scale(1.05)}.fn-text{display:block;margin:20px auto 0;border:0;background:transparent;color:var(--muted);font:800 9px/1 var(--font-body),sans-serif;letter-spacing:.17em;cursor:pointer}.fn-signoff{display:flex;align-items:center;justify-content:space-between;margin-top:55px;padding-top:16px;border-top:1px solid var(--line)}.fn-signoff img{width:58px}.fn-signoff span{font-size:8px;letter-spacing:.16em;color:var(--muted)}
        .fn-footer{padding-bottom:max(18px,env(safe-area-inset-bottom))}.fn-progress{display:flex;gap:5px}.fn-progress span{width:20px;height:2px;background:var(--line);transition:.35s}.fn-progress span.active{width:36px;background:var(--ink)}
        @media (min-width:700px){.fn-header,.fn-footer,.fn-stage{width:min(calc(100% - 72px),680px)}.fn-stage{min-height:calc(100svh - 140px)}}@media (prefers-reduced-motion:reduce){.fn-orbit,.fn-halo,.fn-stars,.fn-sigil-core,.fn-dot,.fn-meta i{animation:none}.fn-screen{animation:none}}
      `}</style>
    </main>
  );
}
