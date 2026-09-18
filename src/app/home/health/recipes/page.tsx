"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, Clock3, Search, Utensils, X } from "lucide-react";

type R={title:string;time:string;tag:string;ingredients:string[];steps:string[]};
const RECIPES:R[]=[
{title:"LIVV Chicken Rice Bowl",time:"25 min",tag:"High protein",ingredients:["8 oz chicken breast","1 cup cooked rice","1 cup broccoli","1 tsp olive oil","Garlic, pepper, salt"],steps:["Season chicken.","Cook through and slice.","Warm rice and broccoli.","Assemble and season."]},
{title:"Steak & Egg Plate",time:"15 min",tag:"Protein",ingredients:["5 oz lean steak","2 eggs","1 cup potatoes","Greens"],steps:["Season steak.","Sear to preference.","Cook eggs and potatoes.","Serve with greens."]},
{title:"Overnight Oats",time:"5 min",tag:"Breakfast",ingredients:["1/2 cup oats","3/4 cup milk","Greek yogurt","Banana","Cinnamon"],steps:["Mix oats, milk and yogurt.","Chill overnight.","Top with banana and cinnamon."]},
{title:"Salmon Green Bowl",time:"20 min",tag:"Omega-3",ingredients:["6 oz salmon","Rice or quinoa","Spinach","Cucumber","Lemon"],steps:["Season and cook salmon.","Build the bowl.","Add salmon and lemon."]},
{title:"Turkey Power Wrap",time:"10 min",tag:"Quick",ingredients:["Whole-grain wrap","4 oz turkey","Spinach","Tomato","Greek yogurt or hummus"],steps:["Spread yogurt or hummus.","Layer ingredients.","Roll and slice."]},
{title:"Recovery Smoothie",time:"5 min",tag:"Recovery",ingredients:["Banana","Greek yogurt","Milk","Frozen berries","Oats"],steps:["Add everything to a blender.","Blend smooth.","Adjust texture with milk."]},
];

export default function RecipesPage(){
 const [q,setQ]=useState(""),[sel,setSel]=useState<R|null>(null);
 const list=useMemo(()=>RECIPES.filter(r=>(r.title+" "+r.tag+" "+r.ingredients.join(" ")).toLowerCase().includes(q.toLowerCase())),[q]);
 return <main className="livv-page min-h-full">
  <div className="mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
   <header className="pt-6 sm:pt-9">
    <Link href="/home/health" className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted"><ChevronLeft size={13}/> Health</Link>
    <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-livv-accent"><Utensils size={13}/> Food</div>
    <h1 className="mt-2 text-[38px] font-semibold leading-[.98] tracking-[-.06em] sm:text-[46px]">Eat like you mean it.</h1>
    <p className="mt-4 max-w-[39ch] text-[13px] leading-6 text-livv-muted">Straightforward meals built around real food, repeatability, and getting on with your day.</p>
   </header>
   <div className="relative mt-8 border-y border-livv-border">
    <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-livv-muted"/>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search recipes, ingredients, or goals..." className="w-full bg-transparent py-4 pl-7 pr-2 text-[13px] outline-none placeholder:text-livv-muted"/>
   </div>
   <section className="mt-8">
    <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">Recipes</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.045em]">Keep it practical.</h2></div><span className="text-[10px] uppercase tracking-[.14em] text-livv-muted">{list.length} shown</span></div>
    <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">
     {list.map((r,i)=><button key={r.title} type="button" onClick={()=>setSel(r)} className="group flex w-full items-center gap-4 py-5 text-left">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-[10px] font-semibold tabular-nums text-livv-muted">{String(i+1).padStart(2,"0")}</span>
      <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">{r.title}</span><span className="mt-1 flex items-center gap-2 text-[11px] text-livv-muted"><span>{r.tag}</span><span>·</span><Clock3 size={12}/><span>{r.time}</span></span></span>
      <ArrowRight size={16} className="shrink-0 text-livv-muted transition-transform group-hover:translate-x-0.5"/>
     </button>)}
    </div>
    {!list.length&&<p className="py-10 text-center text-[13px] text-livv-muted">Nothing matched that search.</p>}
   </section>
   {sel&&<section className="mt-8 border-y border-livv-border py-6">
    <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-accent">{sel.tag} · {sel.time}</p><h2 className="mt-2 text-[27px] font-semibold tracking-[-.05em]">{sel.title}</h2></div><button type="button" onClick={()=>setSel(null)} className="grid h-9 w-9 place-items-center rounded-full border border-livv-border text-livv-muted" aria-label="Close recipe"><X size={15}/></button></div>
    <div className="mt-7 grid gap-7 sm:grid-cols-2">
     <div><h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">Ingredients</h3><ul className="mt-3 space-y-2 text-[13px] leading-5">{sel.ingredients.map(x=><li key={x} className="text-livv-muted">• {x}</li>)}</ul></div>
     <div><h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">Method</h3><ol className="mt-3 space-y-3 text-[13px] leading-5">{sel.steps.map((x,i)=><li key={x}><span className="mr-2 font-semibold text-livv-accent">{i+1}.</span>{x}</li>)}</ol></div>
    </div>
   </section>}
  </div>
 </main>;
}
