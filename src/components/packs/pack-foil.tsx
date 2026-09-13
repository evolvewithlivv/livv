"use client";

import { GRADE_META, type PackGrade } from "@/lib/packs";

export function PackFoil({grade,size="md",pulse}:{grade:PackGrade;size?:"sm"|"md"|"lg";pulse?:boolean}){
 const meta=GRADE_META[grade];const dims=size==="lg"?"h-[300px] w-[188px]":size==="sm"?"h-[112px] w-[72px]":"h-[184px] w-[116px]";
 return <div className={`relative shrink-0 ${dims} ${pulse?"pack-pulse":""}`}><div className="relative h-full w-full overflow-hidden rounded-[18px] border" style={{borderColor:`${meta.foilTo}88`,background:`radial-gradient(circle at 30% 18%,${meta.foilTo}cc,transparent 28%),linear-gradient(145deg,${meta.foilFrom},#050608 48%,${meta.foilTo}44)`,boxShadow:`0 18px 45px rgba(0,0,0,.5),0 0 28px ${meta.foilTo}22`}}><div className="absolute inset-0 bg-[linear-gradient(125deg,transparent_20%,rgba(255,255,255,.22)_35%,transparent_48%,rgba(255,255,255,.08)_70%,transparent_82%)] opacity-60"/><div className="relative flex h-full flex-col items-center justify-between p-3 text-center"><div className="text-[7px] font-bold uppercase tracking-[0.35em]" style={{color:meta.foilTo}}>LIVV</div><div><div className="font-display text-[22px] font-semibold tracking-[-0.06em]" style={{color:"white",textShadow:`0 0 20px ${meta.foilTo}`}}>{meta.name.replace(" Pack","")}</div><div className="mt-2 text-[7px] uppercase tracking-[0.22em]" style={{color:"rgba(255,255,255,.7)"}}>EVOLUTION SERIES</div></div><div className="h-px w-1/2" style={{background:meta.foilTo}}/></div></div></div>;
}
