"use client";
import { useEffect } from "react";
export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{},[]);
 return <main className="grid min-h-[100dvh] place-items-center bg-[var(--livv-bg)] px-6 text-white"><div className="w-full max-w-sm text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-rose-300/15 bg-rose-300/[0.05] text-2xl">!</div><p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/30">LIVV</p><h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">That didn’t land.</h1><p className="mt-3 text-sm leading-relaxed text-white/40">Something interrupted this screen. Your progress is safe. Try loading it again.</p><div className="mt-7 flex justify-center gap-2"><button type="button" onClick={()=>reset()} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Try again</button><button type="button" onClick={()=>window.location.assign("/")} className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/80">Home</button></div></div></main>;
}
