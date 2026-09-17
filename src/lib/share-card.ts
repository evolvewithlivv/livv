export type ShareTemplate = "evolution" | "daily" | "workout" | "streak" | "life" | "weekly" | "milestone" | "identity" | "editorial";
export type ShareFont = "sans" | "display" | "mono" | "serif";
export type ShareLogo = "auto" | "white" | "black";

export type ShareCardData = {
  displayName:string; username:string; level:number; evolutionName:string; streak:number; tierLabel:string;
  tierColor:string; embers:number; workoutsCompleted:number; dailyScore:number; bodyScore:number;
  weeklyActive:number; weeklyWorkouts:number; mindSessions:number; customPhoto?:string|null; backgroundSrc?:string|null;
  workoutName:string; focus:string; duration:string; exerciseCount:number; font?:ShareFont; textColor?:string; logo?:ShareLogo;
};

const W=1080,H=1350;
const F:Record<ShareFont,string>={sans:"Arial,Helvetica,sans-serif",display:"Arial Black,Arial,sans-serif",mono:"monospace",serif:"Georgia,serif"};
const WHITE_LOGO="/share-backgrounds/LIVV%20Pillars%20Logo%20-%20WHITE.PNG";
const BLACK_LOGO="/share-backgrounds/LIVV%20Pillars%20Logo%20-%20BLACK.PNG";

const loadImage=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{
  const image=new Image(); image.onload=()=>resolve(image); image.onerror=reject; image.src=src;
});

const put=(c:CanvasRenderingContext2D,s:string,x:number,y:number,n:number,w:number,col:string,f:ShareFont,align:CanvasTextAlign="left")=>{
  c.font=`${w} ${n}px ${F[f]}`; c.fillStyle=col; c.textAlign=align; c.fillText(s,x,y);
};
const track=(c:CanvasRenderingContext2D,s:string,x:number,y:number,n:number,col:string,f:ShareFont,align:CanvasTextAlign="left")=>{
  c.font=`650 ${n}px ${F[f]}`; c.fillStyle=col; c.textAlign=align;
  const gap=n*.16, width=c.measureText(s).width+gap*Math.max(0,s.length-1);
  let xx=align==="center"?x-width/2:x;
  for(const ch of s){c.fillText(ch,xx,y);xx+=c.measureText(ch).width+gap;}
};

function cover(c:CanvasRenderingContext2D,image:CanvasImageSource,nw:number,nh:number){
  const scale=Math.max(W/nw,H/nh), sw=W/scale, sh=H/scale;
  c.drawImage(image,(nw-sw)/2,(nh-sh)/2,sw,sh,0,0,W,H);
}

async function background(c:CanvasRenderingContext2D,src:string|null,accent:string){
  c.fillStyle="#080a0d"; c.fillRect(0,0,W,H);
  if(src) try { const image=await loadImage(src); cover(c,image,image.naturalWidth,image.naturalHeight); } catch {}
  const g=c.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"rgba(0,0,0,.16)"); g.addColorStop(.42,"rgba(0,0,0,.24)"); g.addColorStop(1,"rgba(0,0,0,.82)");
  c.fillStyle=g; c.fillRect(0,0,W,H);
  const r=c.createRadialGradient(860,160,0,860,160,620);
  r.addColorStop(0,accent+"45"); r.addColorStop(1,"transparent");
  c.fillStyle=r; c.fillRect(0,0,W,H);
}

async function logo(c:CanvasRenderingContext2D,choice:ShareLogo,backgroundSrc:string|null){
  let selected=choice;
  if(selected==="auto"){
    try{
      const image=await loadImage(backgroundSrc||"");
      const sample=document.createElement("canvas"); sample.width=24; sample.height=24;
      const sc=sample.getContext("2d"); if(sc){
        const scale=Math.max(24/image.naturalWidth,24/image.naturalHeight);
        const sw=24/scale, sh=24/scale;
        sc.drawImage(image,(image.naturalWidth-sw)/2,(image.naturalHeight-sh)/2,sw,sh,0,0,24,24);
        const pixels=sc.getImageData(0,0,24,24).data; let total=0,count=0;
        for(let i=0;i<pixels.length;i+=4){total+=(.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2]);count++;}
        selected=total/count>150?"black":"white";
      } else selected="white";
    }catch{selected="white";}
  }
  const src=selected==="black"?BLACK_LOGO:WHITE_LOGO;
  try{
    const image=await loadImage(src);
    const maxW=300,maxH=118,scale=Math.min(maxW/image.naturalWidth,maxH/image.naturalHeight);
    c.drawImage(image,72,46,image.naturalWidth*scale,image.naturalHeight*scale);
  }catch{
    put(c,"LIVV",72,92,42,800,"#fff","sans");
  }
}

function line(c:CanvasRenderingContext2D,y:number,col:string){c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.moveTo(72,y);c.lineTo(W-72,y);c.stroke();}
function metric(c:CanvasRenderingContext2D,l:string,v:string,x:number,y:number,col:string,f:ShareFont){track(c,l,x,y,12,col,f);put(c,v,x,y+47,34,650,col,f);}

export async function renderLIVVShareCard(t:ShareTemplate,d:ShareCardData):Promise<Blob>{
  const canvas=document.createElement("canvas"); canvas.width=W; canvas.height=H;
  const c=canvas.getContext("2d"); if(!c) throw Error("canvas");
  const f=d.font||"sans", col=d.textColor||"#fff";
  const isWhiteText=col.toLowerCase()==="#ffffff"||col.toLowerCase()==="#fff";
  // Every piece of card copy follows the selected text color. The logo is independent.
  const muted=isWhiteText?"rgba(255,255,255,.68)":"rgba(0,0,0,.62)";
  await background(c,d.backgroundSrc||d.customPhoto||null,d.tierColor||"#1769ff");
  await logo(c,d.logo||"auto",d.backgroundSrc||d.customPhoto||null);

  if(t==="evolution"){
    track(c,"LEVEL",W/2,255,26,muted,f,"center"); put(c,String(d.level),W/2,575,340,800,col,f,"center");
    track(c,"EVOLVING",W/2,650,34,col,f,"center"); put(c,d.displayName.slice(0,28),W/2,1130,36,600,col,f,"center");
    put(c,`@${d.username}`.slice(0,32),W/2,1164,18,500,muted,f,"center"); line(c,1200,muted);
    metric(c,"STREAK",`${d.streak} DAYS`,96,1250,col,f); metric(c,"WORKOUTS",String(d.workoutsCompleted),360,1250,col,f);
    metric(c,"MIND",String(d.mindSessions),620,1250,col,f); metric(c,"LIFE",`${d.bodyScore}%`,835,1250,col,f);
  } else if(t==="daily"){
    track(c,"TODAY",W/2,270,30,col,f,"center"); put(c,String(d.dailyScore),W/2,525,300,800,col,f,"center");
    track(c,"DAILY SCORE",W/2,580,25,muted,f,"center"); line(c,650,muted);
    metric(c,"MOVEMENT",d.weeklyWorkouts?"✓":"—",100,715,col,f); metric(c,"MIND",d.mindSessions?"✓":"—",330,715,col,f);
    metric(c,"NUTRITION",`${d.dailyScore}%`,560,715,col,f); metric(c,"DISCIPLINE",d.streak?"✓":"—",800,715,col,f);
  } else if(t==="workout"){
    track(c,"TRAIN",72,300,22,muted,f); put(c,d.workoutName.slice(0,28),72,425,72,800,col,f);
    put(c,`${d.focus} • ${d.duration}`,72,480,25,500,muted,f); line(c,550,muted);
    metric(c,"MOVES",String(d.exerciseCount),92,635,col,f); metric(c,"LEVEL",String(d.level),340,635,col,f);
    metric(c,"STREAK",`${d.streak} DAYS`,588,635,col,f); metric(c,"COMPLETION","100%",836,635,col,f);
  } else if(t==="streak"){
    put(c,String(d.streak),W/2,675,430,800,col,f,"center"); track(c,"DAY STREAK",W/2,745,35,col,f,"center");
    line(c,800,muted); track(c,d.streak>=30?"STILL SHOWING UP.":"KEEP SHOWING UP.",W/2,865,18,muted,f,"center");
    put(c,d.displayName.slice(0,28),W/2,1115,27,600,col,f,"center");
  } else if(t==="life"){
    track(c,"LIFE AREA",72,315,20,muted,f); put(c,"BODY",72,390,78,800,col,f);
    c.beginPath(); c.arc(270,675,145,-Math.PI/2,-Math.PI/2+Math.PI*2*d.bodyScore/100); c.strokeStyle=d.tierColor||"#1769ff"; c.lineWidth=28; c.stroke();
    put(c,`${d.bodyScore}%`,270,690,54,700,col,f,"center");
    [["MIND",d.mindSessions?78:0],["FOOD",d.dailyScore],["HOME",67],["ENVIRONMENT",71],["DISCIPLINE",d.streak?89:0]].forEach(([l,v],i)=>{track(c,String(l),520,550+i*72,14,muted,f);put(c,`${v}%`,950,550+i*72,18,600,col,f,"right");});
  } else if(t==="weekly"){
    track(c,"THIS WEEK",72,330,22,muted,f); put(c,`+${Math.max(0,d.weeklyActive*3)}%`,72,510,150,800,col,f);
    track(c,"EVOLUTION SCORE",78,560,25,col,f); line(c,620,muted);
    metric(c,"WORKOUTS",String(d.weeklyWorkouts),92,700,col,f); metric(c,"DAYS ACTIVE",String(d.weeklyActive),380,700,col,f); metric(c,"MIND SESSIONS",String(d.mindSessions),680,700,col,f);
  } else if(t==="milestone"){
    track(c,"MILESTONE",W/2,350,24,muted,f,"center"); const m=d.streak>=100?100:d.streak>=30?30:7;
    put(c,String(m),W/2,760,360,800,col,f,"center"); track(c,"DAYS OF SHOWING UP",W/2,850,24,col,f,"center");
  } else if(t==="identity"){
    track(c,"LIVV IDENTITY",72,310,18,muted,f); put(c,d.displayName.slice(0,24),72,400,48,750,col,f);
    put(c,`@${d.username}`.slice(0,30),72,435,18,500,muted,f); line(c,500,muted);
    metric(c,"LIVV LEVEL",String(d.level),92,585,col,f); metric(c,"TIER",d.tierLabel.toUpperCase(),380,585,col,f);
    metric(c,"STREAK",`${d.streak} DAYS`,92,730,col,f); metric(c,"EVOLUTION SCORE",String(d.dailyScore),380,730,col,f);
  } else {
    track(c,"PROGRESS",72,365,18,muted,f); put(c,"LOOKS GOOD",72,450,70,800,col,f); put(c,"ON YOU.",72,520,70,800,col,f); line(c,930,muted);
  }
  return new Promise((resolve,reject)=>canvas.toBlob((blob)=>blob?resolve(blob):reject(Error("blob")),"image/png"));
}

export const renderProfileShareCard=(d:ShareCardData)=>renderLIVVShareCard("evolution",d);
export const renderWorkoutShareCard=(d:ShareCardData)=>renderLIVVShareCard("workout",d);

export async function shareOrDownloadBlob(blob:Blob,filename:string,title:string){
  const file=new File([blob],filename,{type:"image/png"});
  if(typeof navigator!=="undefined"&&navigator.share&&navigator.canShare?.({files:[file]})){
    try{await navigator.share({files:[file],title,text:title});return "shared";}catch{}
  }
  const u=URL.createObjectURL(blob),a=document.createElement("a"); a.href=u; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(u),1000); return "downloaded";
}
