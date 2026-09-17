"use client";

type OrbitItem = {
  id: string;
  label: string;
  color: string;
  href: string;
  complete: boolean;
};

type CapabilityOrbitProps = {
  items: OrbitItem[];
  onSelect: (item: OrbitItem) => void;
};

const angles = [-90, -30, 30, 90, 150, 210];

export function CapabilityOrbit({ items, onSelect }: CapabilityOrbitProps) {
  const visible = items.slice(0, 6);
  const done = visible.filter((item) => item.complete).length;
  const progress = Math.round((done / Math.max(visible.length, 1)) * 100);

  return (
    <section className="relative mt-7 overflow-hidden rounded-[26px] border border-white/10 bg-white/[.018] px-4 pb-5 pt-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(15,127,255,.07),transparent_32%),radial-gradient(circle_at_18%_80%,rgba(77,255,0,.035),transparent_25%)]" />
      <div className="relative z-10 flex items-end justify-between px-1">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[.3em] text-livv-accent">Capability map</p>
          <h2 className="font-display mt-2 text-[25px] font-semibold leading-[.98]">Your life, in six directions.</h2>
        </div>
        <div className="text-right">
          <p className="font-display text-[25px] font-semibold tracking-[-.05em]">{done}<span className="text-white/25">/6</span></p>
          <p className="text-[9px] uppercase tracking-[.18em] text-livv-muted">active</p>
        </div>
      </div>

      <div className="relative mx-auto mt-5 h-[325px] w-full max-w-[350px]">
        <svg viewBox="0 0 350 325" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <radialGradient id="livvRadarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F7FFF" stopOpacity=".08" />
              <stop offset="65%" stopColor="#0F7FFF" stopOpacity=".02" />
              <stop offset="100%" stopColor="#0F7FFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="175" cy="162" r="126" fill="url(#livvRadarFill)" />
          <circle cx="175" cy="162" r="124" fill="none" stroke="rgba(255,255,255,.09)" />
          <circle cx="175" cy="162" r="92" fill="none" stroke="rgba(255,255,255,.07)" />
          <circle cx="175" cy="162" r="60" fill="none" stroke="rgba(255,255,255,.055)" />
          {visible.map((item, index) => {
            const rad = (angles[index] * Math.PI) / 180;
            const x = 175 + Math.cos(rad) * 124;
            const y = 162 + Math.sin(rad) * 124;
            return <g key={item.id}>
              <line x1="175" y1="162" x2={x} y2={y} stroke={item.color} strokeOpacity=".22" strokeWidth="1" />
              <circle cx={x} cy={y} r={item.complete ? 4.5 : 3.5} fill={item.color} fillOpacity={item.complete ? 1 : .65} />
            </g>;
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 grid h-[116px] w-[116px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-[rgb(var(--livv-surface)/.9)] shadow-[0_18px_60px_rgba(0,0,0,.5)] backdrop-blur-xl">
          <div className="text-center">
            <p className="font-display text-[27px] font-semibold tracking-[-.07em]">LIVV</p>
            <div className="mx-auto mt-3 h-px w-9 bg-[#0F7FFF]/50" />
            <p className="mt-2 text-[8px] font-semibold uppercase tracking-[.25em] text-livv-muted">{progress}% active</p>
          </div>
        </div>

        {visible.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            aria-label={`${item.label}. ${item.complete ? "Complete today." : "Open."}`}
            className="absolute z-20 w-[104px] -translate-x-1/2 rounded-[20px] border bg-[rgb(var(--livv-surface)/.9)] px-3 py-3 text-left shadow-[0_12px_32px_rgba(0,0,0,.3)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 active:scale-95"
            style={{
              left: `${50 + Math.cos((angles[index] * Math.PI) / 180) * 42}%`,
              top: `${50 + Math.sin((angles[index] * Math.PI) / 180) * 38}%`,
              borderColor: item.complete ? `${item.color}65` : "rgba(255,255,255,.10)",
            }}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-[.16em]" style={{ color: item.color }}>{item.label}</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}70` }} />
            </span>
            <span className="mt-2 block text-[9px] uppercase tracking-[.13em] text-livv-muted">{item.complete ? "Logged" : "Open"}</span>
          </button>
        ))}
      </div>

      <div className="relative grid grid-cols-2 gap-x-3 border-t border-white/10 pt-4">
        {visible.map((item) => (
          <button key={`${item.id}-summary`} type="button" onClick={() => onSelect(item)} className="flex items-center justify-between border-b border-white/[.06] py-2.5 text-left last:border-0">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.color }} />
              <span className="truncate text-[9px] font-semibold uppercase tracking-[.13em]" style={{ color: item.color }}>{item.label}</span>
            </span>
            <span className="text-[9px] text-livv-muted">{item.complete ? "Done" : "Open"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
