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

const positions = [
  "left-1/2 top-0 -translate-x-1/2",
  "right-0 top-[17%]",
  "right-0 bottom-[17%]",
  "left-1/2 bottom-0 -translate-x-1/2",
  "left-0 bottom-[17%]",
  "left-0 top-[17%]",
];

export function CapabilityOrbit({ items, onSelect }: CapabilityOrbitProps) {
  const done = items.filter((item) => item.complete).length;
  const progress = Math.round((done / Math.max(items.length, 1)) * 100);

  return (
    <section className="relative mt-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] px-4 pb-5 pt-4">
      <div className="relative z-10 flex items-end justify-between px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-livv-accent-soft">Capability map</p>
          <h2 className="font-display mt-1 text-[22px] font-semibold">Keep the whole system moving.</h2>
        </div>
        <div className="text-right">
          <p className="font-display text-[24px] font-semibold">{progress}%</p>
          <p className="text-[9px] uppercase tracking-[0.16em] text-livv-muted">active today</p>
        </div>
      </div>

      <div className="relative mx-auto mt-4 h-[310px] w-full max-w-[340px]">
        <div className="motion-safe:animate-[livv-orbit-spin_32s_linear_infinite] absolute left-1/2 top-1/2 h-[238px] w-[238px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-55" style={{ background: "conic-gradient(from -18deg, #F93827, #F61981, #9A00FF, #4DFF00, #FCF927, #FF9D23, #0F7FFF, #F93827)" }} />
        <div className="absolute left-1/2 top-1/2 h-[232px] w-[232px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--livv-bg))]" />
        <div className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-1/2 h-[148px] w-[148px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

        <div className="absolute left-1/2 top-1/2 z-10 grid h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[30px] border border-white/15 bg-[rgb(var(--livv-surface)/.82)] shadow-[0_20px_55px_rgba(0,0,0,.38)] backdrop-blur-xl">
          <div className="text-center">
            <p className="font-display text-[25px] font-semibold tracking-[-.06em]">LIVV</p>
            <p className="mt-1 text-[8px] font-semibold uppercase tracking-[.22em] text-livv-muted">{done}/{items.length} moving</p>
          </div>
        </div>

        {items.slice(0, 6).map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            aria-label={`${item.label}. ${item.complete ? "Complete today." : "Open."}`}
            className={`absolute z-20 grid h-[76px] w-[76px] ${positions[index] ?? "left-1/2 top-1/2"} place-items-center rounded-[24px] border bg-[rgb(var(--livv-surface)/.88)] p-2 text-center shadow-[0_14px_34px_rgba(0,0,0,.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(0,0,0,.38)] active:scale-95`}
            style={{ borderColor: item.complete ? `${item.color}70` : "rgba(255,255,255,.10)" }}
          >
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 14px ${item.color}80` }} />
            <span className="text-[10px] font-semibold uppercase tracking-[.12em]" style={{ color: item.color }}>{item.label}</span>
            <span className="mt-1 text-[8px] uppercase tracking-[.12em] text-livv-muted">{item.complete ? "Complete" : "Open"}</span>
          </button>
        ))}

        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          {items.slice(0, 6).map((item, index) => (
            <span key={`${item.id}-line`} className="absolute left-1/2 top-1/2 h-px origin-left" style={{ width: index % 2 === 0 ? 112 : 96, transform: `rotate(${index * 60 - 90}deg)`, background: `linear-gradient(90deg, transparent, ${item.color})` }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-1">
        {items.slice(0, 6).map((item) => (
          <button key={`${item.id}-summary`} type="button" onClick={() => onSelect(item)} className="rounded-2xl border border-white/10 bg-black/[.08] px-2 py-2 text-left">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
              <span className="truncate text-[9px] font-semibold uppercase tracking-[.12em]" style={{ color: item.color }}>{item.label}</span>
            </span>
            <span className="mt-1 block text-[9px] text-livv-muted">{item.complete ? "Logged" : "Ready"}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes livv-orbit-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.motion-safe\\:animate-\\[livv-orbit-spin_32s_linear_infinite\\]) { animation: none; }
        }
      `}</style>
    </section>
  );
}
