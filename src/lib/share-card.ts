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
  void accent;
}

async function logo(c:CanvasRenderingContext2D,mode:ShareLogo,backgroundSrc:string|null){
  let selected:"white"|"black"=mode==="black"?"black":mode==="white"?"white":"white";
  if(mode==="auto"){
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

/** Draw circular avatar with tier ring. Falls back to initial on failure. */
async function drawAvatar(
  c: CanvasRenderingContext2D,
  src: string | null | undefined,
  cx: number,
  cy: number,
  r: number,
  ring: string,
  name: string,
) {
  const glow = c.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.35);
  glow.addColorStop(0, "transparent");
  glow.addColorStop(0.55, "transparent");
  glow.addColorStop(1, ring + "55");
  c.fillStyle = glow;
  c.beginPath();
  c.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
  c.fill();

  c.beginPath();
  c.arc(cx, cy, r + 10, 0, Math.PI * 2);
  c.strokeStyle = ring;
  c.lineWidth = 8;
  c.stroke();

  c.save();
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.closePath();
  c.clip();
  c.fillStyle = "#1a1c20";
  c.fillRect(cx - r, cy - r, r * 2, r * 2);

  let drew = false;
  if (src) {
    try {
      const image = await loadImage(src);
      const scale = Math.max((r * 2) / image.naturalWidth, (r * 2) / image.naturalHeight);
      const sw = (r * 2) / scale;
      const sh = (r * 2) / scale;
      c.drawImage(
        image,
        (image.naturalWidth - sw) / 2,
        (image.naturalHeight - sh) / 2,
        sw,
        sh,
        cx - r,
        cy - r,
        r * 2,
        r * 2,
      );
      drew = true;
    } catch {
      /* fall through */
    }
  }
  if (!drew) {
    const initial = (name || "L").trim().charAt(0).toUpperCase() || "L";
    c.fillStyle = "#f5f5f2";
    c.font = `700 ${Math.round(r * 0.9)}px Arial,Helvetica,sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(initial, cx, cy + 4);
  }
  c.restore();
}

/** Premium profile identity card — photo, tier ring, stats. */
async function renderIdentityCard(c: CanvasRenderingContext2D, d: ShareCardData) {
  const accent = d.tierColor || "#1769ff";
  const bgSrc = d.backgroundSrc || null;
  const photoSrc = d.customPhoto || null;

  c.fillStyle = "#0a0c10";
  c.fillRect(0, 0, W, H);
  if (bgSrc) {
    try {
      const image = await loadImage(bgSrc);
      cover(c, image, image.naturalWidth, image.naturalHeight);
    } catch {
      /* keep base */
    }
  }

  const topFade = c.createLinearGradient(0, 0, 0, 420);
  topFade.addColorStop(0, "rgba(0,0,0,.55)");
  topFade.addColorStop(1, "transparent");
  c.fillStyle = topFade;
  c.fillRect(0, 0, W, 420);

  const bottomFade = c.createLinearGradient(0, 520, 0, H);
  bottomFade.addColorStop(0, "transparent");
  bottomFade.addColorStop(0.35, "rgba(0,0,0,.55)");
  bottomFade.addColorStop(1, "rgba(0,0,0,.92)");
  c.fillStyle = bottomFade;
  c.fillRect(0, 520, W, H - 520);

  const wash = c.createRadialGradient(W / 2, 380, 40, W / 2, 380, 520);
  wash.addColorStop(0, accent + "33");
  wash.addColorStop(1, "transparent");
  c.fillStyle = wash;
  c.fillRect(0, 120, W, 700);

  await logo(c, "white", bgSrc);

  const name = d.displayName || d.username || "Member";
  await drawAvatar(c, photoSrc, W / 2, 430, 168, accent, name);

  track(c, "LIVV IDENTITY", W / 2, 660, 18, "rgba(255,255,255,.55)", "sans", "center");
  put(c, name.slice(0, 22), W / 2, 740, 58, 750, "#ffffff", "sans", "center");
  put(c, `@${(d.username || "livv").slice(0, 28)}`, W / 2, 788, 24, 500, "rgba(255,255,255,.55)", "sans", "center");

  const tier = (d.tierLabel || "Spark").toUpperCase();
  c.font = `700 18px Arial,Helvetica,sans-serif`;
  const tw = c.measureText(tier).width;
  const pillW = tw + 56;
  const pillX = W / 2 - pillW / 2;
  const pillY = 820;
  c.beginPath();
  const pr = 22;
  c.moveTo(pillX + pr, pillY);
  c.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + 44, pr);
  c.arcTo(pillX + pillW, pillY + 44, pillX, pillY + 44, pr);
  c.arcTo(pillX, pillY + 44, pillX, pillY, pr);
  c.arcTo(pillX, pillY, pillX + pillW, pillY, pr);
  c.closePath();
  c.fillStyle = accent + "28";
  c.fill();
  c.strokeStyle = accent + "99";
  c.lineWidth = 2;
  c.stroke();
  put(c, tier, W / 2, 850, 18, 700, accent, "sans", "center");

  if (d.evolutionName) {
    put(c, d.evolutionName, W / 2, 920, 28, 600, "rgba(255,255,255,.72)", "sans", "center");
  }

  const panelY = 1000;
  const panelH = 200;
  c.fillStyle = "rgba(255,255,255,.06)";
  c.strokeStyle = "rgba(255,255,255,.12)";
  c.lineWidth = 1.5;
  roundRect(c, 72, panelY, W - 144, panelH, 28);
  c.fill();
  c.stroke();

  const stats: [string, string][] = [
    ["LEVEL", String(d.level || 1)],
    ["STREAK", `${d.streak || 0}D`],
    ["WORKOUTS", String(d.workoutsCompleted || 0)],
    ["XP", `${d.dailyScore || 0}%`],
  ];
  const colW = (W - 144) / 4;
  stats.forEach(([label, value], i) => {
    const x = 72 + colW * i + colW / 2;
    track(c, label, x, panelY + 58, 14, "rgba(255,255,255,.4)", "sans", "center");
    put(c, value, x, panelY + 128, 42, 700, "#ffffff", "sans", "center");
  });

  put(c, "Evolve with purpose.", W / 2, 1288, 22, 500, "rgba(255,255,255,.35)", "sans", "center");
}

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export async function renderLIVVShareCard(t:ShareTemplate,d:ShareCardData):Promise<Blob>{
  const canvas=document.createElement("canvas"); canvas.width=W; canvas.height=H;
  const c=canvas.getContext("2d"); if(!c) throw Error("canvas");
  const f=d.font||"sans", col=d.textColor||"#fff";

  if (t === "identity") {
    await renderIdentityCard(c, d);
    return new Promise((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(Error("blob"))), "image/png"),
    );
  }

  await background(c,d.backgroundSrc||d.customPhoto||null,d.tierColor||"#1769ff");
  await logo(c,d.logo||"auto",d.backgroundSrc||d.customPhoto||null);

  if(t==="evolution"){
    track(c,"LEVEL",W/2,255,26,col,f,"center"); put(c,String(d.level),W/2,575,340,800,col,f,"center");
    track(c,"EVOLVING",W/2,650,34,col,f,"center"); put(c,d.displayName.slice(0,28),W/2,1130,36,600,col,f,"center");
    put(c,`@${d.username}`.slice(0,32),W/2,1164,18,500,col,f,"center"); line(c,1200,col);
    metric(c,"STREAK",`${d.streak} DAYS`,96,1250,col,f); metric(c,"WORKOUTS",String(d.workoutsCompleted),360,1250,col,f);
    metric(c,"MIND",String(d.mindSessions),620,1250,col,f); metric(c,"LIFE",`${d.bodyScore}%`,835,1250,col,f);
  } else if(t==="daily"){
    track(c,"TODAY",W/2,270,30,col,f,"center"); put(c,String(d.dailyScore),W/2,525,300,800,col,f,"center");
    track(c,"DAILY SCORE",W/2,580,25,col,f,"center"); line(c,650,col);
    metric(c,"MOVEMENT",d.weeklyWorkouts?"✓":"—",100,715,col,f); metric(c,"MIND",d.mindSessions?"✓":"—",330,715,col,f);
    metric(c,"NUTRITION",`${d.dailyScore}%`,560,715,col,f); metric(c,"DISCIPLINE",d.streak?"✓":"—",800,715,col,f);
  } else if(t==="workout"){
    track(c,"TRAIN",72,300,22,col,f); put(c,d.workoutName.slice(0,28),72,425,72,800,col,f);
    put(c,`${d.focus} • ${d.duration}`,72,480,25,500,col,f); line(c,550,col);
    metric(c,"MOVES",String(d.exerciseCount),92,635,col,f); metric(c,"LEVEL",String(d.level),340,635,col,f);
    metric(c,"STREAK",`${d.streak} DAYS`,588,635,col,f); metric(c,"COMPLETION","100%",836,635,col,f);
  } else if(t==="streak"){
    put(c,String(d.streak),W/2,675,430,800,col,f,"center"); track(c,"DAY STREAK",W/2,745,35,col,f,"center");
    line(c,800,col); track(c,d.streak>=30?"STILL SHOWING UP.":"KEEP SHOWING UP.",W/2,865,18,col,f,"center");
    put(c,d.displayName.slice(0,28),W/2,1115,27,600,col,f,"center");
  } else if(t==="life"){
    track(c,"LIFE AREA",72,315,20,col,f); put(c,"BODY",72,390,78,800,col,f);
    c.beginPath(); c.arc(270,675,145,-Math.PI/2,-Math.PI/2+Math.PI*2*d.bodyScore/100); c.strokeStyle=d.tierColor||"#1769ff"; c.lineWidth=28; c.stroke();
    put(c,`${d.bodyScore}%`,270,690,54,700,col,f,"center");
    [["MIND",d.mindSessions?78:0],["FOOD",d.dailyScore],["HOME",67],["ENVIRONMENT",71],["DISCIPLINE",d.streak?89:0]].forEach(([l,v],i)=>{track(c,String(l),520,550+i*72,14,col,f);put(c,`${v}%`,950,550+i*72,18,600,col,f,"right");});
  } else if(t==="weekly"){
    track(c,"THIS WEEK",72,330,22,col,f); put(c,`+${Math.max(0,d.weeklyActive*3)}%`,72,510,150,800,col,f);
    track(c,"EVOLUTION SCORE",78,560,25,col,f); line(c,620,col);
    metric(c,"WORKOUTS",String(d.weeklyWorkouts),92,700,col,f); metric(c,"DAYS ACTIVE",String(d.weeklyActive),380,700,col,f); metric(c,"MIND SESSIONS",String(d.mindSessions),680,700,col,f);
  } else if(t==="milestone"){
    track(c,"MILESTONE",W/2,350,24,col,f,"center"); const m=d.streak>=100?100:d.streak>=30?30:7;
    put(c,String(m),W/2,760,360,800,col,f,"center"); track(c,"DAYS OF SHOWING UP",W/2,850,24,col,f,"center");
  } else {
    track(c,"PROGRESS",72,365,18,col,f); put(c,"LOOKS GOOD",72,450,70,800,col,f); put(c,"ON YOU.",72,520,70,800,col,f); line(c,930,col);
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
