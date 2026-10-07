"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, ChevronLeft, Clock3 } from "lucide-react";
import { CATEGORIES, RECIPES, type CategoryFilter } from "@/lib/recipes-data";
import { blankDay, loadHealthDays, todayKey, upsertHealthDay } from "@/lib/health";
import "../health-systems.css";

const SAVED_KEY="livv-recipes-saved-v1";
function loadSaved():string[]{if(typeof window==="undefined")return[];try{const raw=localStorage.getItem(SAVED_KEY),parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed.filter((x)=>typeof x==="string"):[]}catch{return[]}}
function persistSaved(ids:string[]){localStorage.setItem(SAVED_KEY,JSON.stringify(ids))}
const SystemNav=()=> <nav className="hsys-nav" aria-label="Health systems"><Link href="/home/health/sleep">Sleep</Link><Link href="/home/health/meditation">Mind</Link><Link href="/home/health/recipes" aria-current="page">Food</Link><Link href="/home/health/trails">Move</Link><Link href="/home/health/dictionary">Knowledge</Link></nav>;

export default function RecipesPage(){
  const[q,setQ]=useState(""),[cat,setCat]=useState<CategoryFilter>("All"),[selId,setSelId]=useState<string|null>(null),[saved,setSaved]=useState<string[]>([]);
  useEffect(()=>setSaved(loadSaved()),[]);
  const list=useMemo(()=>{const needle=q.trim().toLowerCase();return RECIPES.filter(r=>(cat==="All"||r.category===cat)&&(!needle||(r.title+" "+r.tag+" "+r.category+" "+r.blurb+" "+r.ingredients.join(" ")).toLowerCase().includes(needle)))},[q,cat]);
  const selected=list.find(r=>r.id===selId)??RECIPES.find(r=>r.id===selId)??null;
  function toggleSave(id:string){setSaved(prev=>{const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];persistSaved(next);return next})}
  function logMeal(){const date=todayKey(),history=loadHealthDays(),base=history.find(d=>d.date===date)??blankDay(date);upsertHealthDay({...base,meals:Math.min(6,base.meals+1)},history)}

  if(selected)return <main className="hsys hsys-recipes" aria-label={selected.title}><div className="hsys-inner">
    <button type="button" className="hsys-back hsys-back-button" onClick={()=>setSelId(null)}><ChevronLeft size={13}/> Recipes</button>
    <header className="hsys-mast"><p className="hsys-k">{selected.category}</p><h1 className="hsys-title">{selected.title}</h1><p className="hsys-sub">{selected.blurb}</p><div className="hsys-recipe-meta"><span><Clock3 size={10}/> {selected.time} min</span><span>{selected.servings}</span><span>{selected.tag}</span></div></header>
    <SystemNav/>
    <section className="hsys-section"><p className="hsys-label">01 / Ingredients</p><div className="hsys-list">{selected.ingredients.map(ing=><div key={ing} className="hsys-item"><p className="hsys-item-t" style={{fontWeight:500}}>{ing}</p></div>)}</div></section>
    <section className="hsys-section"><p className="hsys-label">02 / Method</p><div className="hsys-list">{selected.steps.map((step,i)=><div key={step} className="hsys-item"><div><p className="hsys-item-t">{String(i+1).padStart(2,"0")}</p><p className="hsys-item-s">{step}</p></div></div>)}</div></section>
    <div className="hsys-actions"><button type="button" className="hsys-btn" style={{marginTop:0}} onClick={logMeal}>Log meal</button><button type="button" className="hsys-btn ghost" style={{marginTop:0}} onClick={()=>toggleSave(selected.id)}><Bookmark size={12} style={{verticalAlign:-2,marginRight:5}}/>{saved.includes(selected.id)?"Saved":"Save"}</button></div>
  </div></main>;

  return <main className="hsys hsys-recipes" aria-label="Recipes"><div className="hsys-inner">
    <Link href="/home/health" className="hsys-back"><ChevronLeft size={13}/> Health</Link>
    <header className="hsys-mast"><p className="hsys-k">03 / Food</p><h1 className="hsys-title">Recipes</h1><p className="hsys-sub">Real meals built around ingredients you can use.</p><div className="hsys-stats"><div><strong>{list.length}</strong><span>Recipes</span></div><div><strong>{saved.length}</strong><span>Saved</span></div><div><strong>{cat==="All"?"ALL":cat}</strong><span>Filter</span></div></div></header>
    <SystemNav/>
    <section className="hsys-section"><label className="hsys-field"><span>Search the kitchen</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ingredient, dish, category"/></label><div className="hsys-chips" style={{marginTop:10}}>{CATEGORIES.map(c=><button key={c} type="button" className={"hsys-chip"+(cat===c?" on":"")} onClick={()=>setCat(c)}>{c}</button>)}</div></section>
    <section className="hsys-section"><p className="hsys-label">{list.length} {list.length===1?"recipe":"recipes"}</p><div className="hsys-list">{list.length===0?<p className="hsys-item-s" style={{padding:"14px 0"}}>Nothing matched that search.</p>:list.map(r=><button key={r.id} type="button" className="hsys-recipe" onClick={()=>setSelId(r.id)}><p className="hsys-recipe-t">{r.title}{saved.includes(r.id)?" · Saved":""}</p><p className="hsys-recipe-s">{r.blurb}</p><div className="hsys-recipe-meta"><span>{r.category}</span><span>{r.time} min</span><span>{r.tag}</span></div></button>)}</div></section>
  </div></main>;
}