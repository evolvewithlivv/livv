"use client";

import type { ReactNode } from "react";

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
  { x: 50, y: 6 },
  { x: 84, y: 30 },
  { x: 84, y: 70 },
  { x: 50, y: 94 },
  { x: 16, y: 70 },
  { x: 16, y: 30 },
];

const icons: Record<string, ReactNode> = {
  body: <path d="M12 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM7.5 11.5h9M9 11.5l-1 8M15 11.5l1 8M12 11.5v8" />,
  mind: <path d="M9.5 19a4.5 4.5 0 0 1-1.1-8.86A4.7 4.7 0 0 1 17.4 9a4.5 4.5 0 0 1-.9 8.87M12 5v14M8.5 13.5h3M12 9h3.5" />,
  career: <path d="M7 7.5h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2ZM9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M5 12h14M10 12v2h4v-2" />,
  finance: <path d="M5 18.5V14M9.5 18.5V11M14 18.5V7.5M18.5 18.5V4.5M4 20h15" />,
  social: <path d="M8.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15.8 11a2.4 2.4 0 1 0 0-4.8M3.5 19a5 5 0 0 1 10 0M14 13.5a4 4 0 0 1 5 5" />,
  life: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M18.36 5.64l-2.12 2.12M7.76 16.24l-2.12 2.12M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />,
};

function Icon({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current stroke-[1.7]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[id] ?? icons.life}
    </svg>
  );
}

export function CapabilityOrbit({ items, onSelect }: CapabilityOrbitProps) {
  const visible = items.slice(0, 6);
  const done = visible.filter((item) => item.complete).length;
  const progress = Math.round((done / Math.max(visible.length, 1)) * 100);

  return (
    <section className="relative mt-7 overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_50%_48%,rgba(15,127,255,.09),transparent_31%),radial-gradient(circle_at_20%_75%,rgba(77,255,0,.035),transparent_24%),rgb(var(--livv-surface)/.82)] px-4 pb-4 pt-5 shadow-[0_24px_80px_rgba(0,0,0,.18)] backdrop-blur-xl sm:px-6">
      <div className="relative z-10 flex items-start justify-between px-1 sm:px-2">
        <div className="max-w-[76%]">
          <p className="text-[9px] font-semibold uppercase tracking-[.32em] text-[#0F7FFF]">Capability map</p>
          <h2 className="font-display mt-2 text-[27px] font-semibold leading-[.94] tracking-[-.055em] sm:text-[31px]">Your life, in six directions.</h2>
          <p className="mt-2 text-[9px] uppercase tracking-[.22em] text-livv-muted">Build balance · unlock potential · live the LIVV</p>
        </div>
        <div className="pt-0.5 text-right">
          <p className="font-display text-[29px] font-semibold leading-none tracking-[-.06em]">{done}<span className="text-white/25">/6</span></p>
          <div className="mt-2 flex items-center justify-end gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#65FF9B] shadow-[0_0_12px_rgba(101,255,155,.8)]" />
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-livv-muted">active</span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-4 h-[370px] w-full max-w-[500px] sm:h-[390px]">
        <svg viewBox="0 0 500 390" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <radialGradient id="capabilityGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F7FFF" stopOpacity=".14" />
              <stop offset="42%" stopColor="#8B5CFF" stopOpacity=".045" />
              <stop offset="100%" stopColor="#0F7FFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="250" cy="195" r="154" fill="url(#capabilityGlow)" />
          <circle cx="250" cy="195" r="139" fill="none" stroke="rgba(255,255,255,.055)" strokeWidth="1" strokeDasharray="2 8" />
          <circle cx="250" cy="195" r="104" fill="none" stroke="rgba(255,255,255,.045)" />
          {visible.map((item, index) => {
            const pos = positions[index];
            const x = (pos.x / 100) * 500;
            const y = (pos.y / 100) * 390;
            return (
              <g key={item.id}>
                <line x1="250" y1="195" x2={x} y2={y} stroke={item.color} strokeOpacity=".38" strokeWidth="1.2" />
                <circle cx={x} cy={y} r="5" fill={item.color} fillOpacity={item.complete ? 1 : .8} />
                <circle cx={x} cy={y} r="10" fill="none" stroke={item.color} strokeOpacity=".13" />
              </g>
            );
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 h-[136px] w-[136px] -translate-x-1/2 -translate-y-1/2 rounded-full p-[2px] shadow-[0_0_65px_rgba(15,127,255,.18)]" style={{ background: "linear-gradient(135deg,#F93827,#F61981,#9A00FF,#0F7FFF,#4DFF00,#FCF927)" }}>
          <div className="grid h-full w-full place-items-center rounded-full border border-white/10 bg-[#080b12]/95 backdrop-blur-2xl">
            <div className="text-center">
              <p className="font-display text-[31px] font-semibold leading-none tracking-[-.08em]">LIVV</p>
              <div className="mx-auto mt-3 h-px w-10 bg-[#0F7FFF]/65" />
              <p className="mt-2 text-[8px] font-semibold uppercase tracking-[.25em] text-white/45">{progress}% active</p>
            </div>
          </div>
        </div>

        {visible.map((item, index) => {
          const pos = positions[index];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              aria-label={`${item.label}. ${item.complete ? "Logged today." : "Open."}`}
              className="group absolute z-20 flex h-[64px] w-[154px] -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-[22px] border bg-[#0b0e15]/90 px-3 shadow-[0_14px_40px_rgba(0,0,0,.34)] backdrop-blur-xl transition duration-300 hover:-translate-y-[calc(50%+3px)] hover:shadow-[0_18px_48px_rgba(0,0,0,.45)] active:scale-[.97] sm:h-[70px] sm:w-[168px]"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, borderColor: `${item.color}70`, boxShadow: `0 0 24px ${item.color}12, 0 14px 40px rgba(0,0,0,.34)` }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border" style={{ color: item.color, borderColor: `${item.color}65`, background: `${item.color}12`, boxShadow: `inset 0 0 18px ${item.color}10` }}>
                <Icon id={item.id} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-[11px] font-semibold uppercase tracking-[.2em]" style={{ color: item.color }}>{item.label}</span>
                <span className="mt-1 block text-[8px] font-medium uppercase tracking-[.2em] text-white/45">{item.complete ? "Logged" : "Open"}</span>
              </span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[.04] text-[15px] text-white/55 transition group-hover:border-white/20 group-hover:text-white">›</span>
            </button>
          );
        })}
      </div>

      <div className="relative grid grid-cols-3 overflow-hidden rounded-[20px] border border-white/10 bg-black/10">
        {visible.map((item, index) => (
          <button key={`${item.id}-summary`} type="button" onClick={() => onSelect(item)} className={`flex min-w-0 flex-col gap-1 px-3 py-3 text-left transition hover:bg-white/[.03] ${index < 3 ? "border-b" : ""} ${index % 3 !== 2 ? "border-r" : ""} border-white/[.07]`}>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}70` }} />
              <span className="truncate text-[8px] font-semibold uppercase tracking-[.13em]" style={{ color: item.color }}>{item.label}</span>
            </span>
            <span className="pl-3 text-[8px] uppercase tracking-[.12em] text-livv-muted">{item.complete ? "Done" : "Open"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
