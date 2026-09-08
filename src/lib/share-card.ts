/** Build shareable PNG cards via canvas for profile + workouts. */

export type ProfileShareData = {
  displayName: string;
  username: string;
  level: number;
  evolutionName: string;
  streak: number;
  tierLabel: string;
  tierColor: string;
  embers: number;
  badges: { icon: string; title: string }[];
  workoutsCompleted: number;
};

export type WorkoutShareData = {
  displayName: string;
  workoutName: string;
  focus: string;
  location: string;
  duration: string;
  exerciseCount: number;
  difficulty?: string;
  level: number;
  streak: number;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function paintBackground(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#07090d");
  g.addColorStop(0.55, "#0c1018");
  g.addColorStop(1, "#080a0f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const blob = ctx.createRadialGradient(w * 0.85, h * 0.15, 20, w * 0.85, h * 0.15, w * 0.55);
  blob.addColorStop(0, accent + "55");
  blob.addColorStop(1, "transparent");
  ctx.fillStyle = blob;
  ctx.fillRect(0, 0, w, h);

  const blob2 = ctx.createRadialGradient(w * 0.1, h * 0.9, 10, w * 0.1, h * 0.9, w * 0.45);
  blob2.addColorStop(0, "#4c8dff22");
  blob2.addColorStop(1, "transparent");
  ctx.fillStyle = blob2;
  ctx.fillRect(0, 0, w, h);
}

export async function renderProfileShareCard(data: ProfileShareData): Promise<Blob> {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  paintBackground(ctx, w, h, data.tierColor || "#4c8dff");

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText("LIVV", 72, 90);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 72px system-ui, sans-serif";
  ctx.fillText(data.displayName.slice(0, 22), 72, 200);

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "500 32px system-ui, sans-serif";
  ctx.fillText(`@${data.username}`, 72, 250);

  roundRect(ctx, 72, 290, 220, 56, 28);
  ctx.fillStyle = (data.tierColor || "#4c8dff") + "33";
  ctx.fill();
  ctx.strokeStyle = (data.tierColor || "#4c8dff") + "88";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = data.tierColor || "#4c8dff";
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.fillText(data.tierLabel.toUpperCase(), 96, 328);

  const stats = [
    { label: "LEVEL", value: String(data.level) },
    { label: "STREAK", value: `${data.streak}d` },
    { label: "SESSIONS", value: String(data.workoutsCompleted) },
  ];
  stats.forEach((s, i) => {
    const x = 72 + i * 320;
    roundRect(ctx, x, 420, 290, 180, 28);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "600 22px system-ui, sans-serif";
    ctx.fillText(s.label, x + 28, 470);
    ctx.fillStyle = "#fff";
    ctx.font = "700 64px system-ui, sans-serif";
    ctx.fillText(s.value, x + 28, 555);
  });

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText("EVOLUTION", 72, 680);
  ctx.fillStyle = "#fff";
  ctx.font = "700 48px system-ui, sans-serif";
  ctx.fillText(data.evolutionName.slice(0, 28), 72, 740);

  if (data.badges.length > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillText("BADGES", 72, 830);
    data.badges.slice(0, 4).forEach((b, i) => {
      const x = 72 + (i % 2) * 480;
      const y = 870 + Math.floor(i / 2) * 100;
      roundRect(ctx, x, y, 440, 80, 20);
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "32px system-ui, sans-serif";
      ctx.fillText(b.icon, x + 24, y + 52);
      ctx.font = "600 28px system-ui, sans-serif";
      ctx.fillText(b.title.slice(0, 18), x + 80, y + 52);
    });
  }

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("evolvewithlivv.com", 72, h - 60);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/png");
  });
}

export async function renderWorkoutShareCard(data: WorkoutShareData): Promise<Blob> {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  paintBackground(ctx, w, h, "#ff6b91");

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText("LIVV \u00b7 WORKOUT", 72, 90);

  ctx.fillStyle = "#ff6b91";
  ctx.font = "700 28px system-ui, sans-serif";
  ctx.fillText("SESSION COMPLETE", 72, 180);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 64px system-ui, sans-serif";
  const name = data.workoutName.length > 28 ? data.workoutName.slice(0, 26) + "\u2026" : data.workoutName;
  const words = name.split(" ");
  let line = "";
  let y = 280;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > w - 144) {
      ctx.fillText(line, 72, y);
      line = word;
      y += 72;
    } else line = test;
  }
  if (line) ctx.fillText(line, 72, y);

  const chips = [data.focus, data.location, data.duration, data.difficulty || ""].filter(Boolean);
  chips.forEach((c, i) => {
    const x = 72 + i * 230;
    roundRect(ctx, x, 520, 210, 64, 32);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillText(c.slice(0, 12), x + 24, 562);
  });

  const metrics = [
    { label: "MOVES", value: String(data.exerciseCount) },
    { label: "LEVEL", value: String(data.level) },
    { label: "STREAK", value: `${data.streak}d` },
  ];
  metrics.forEach((m, i) => {
    const x = 72 + i * 320;
    roundRect(ctx, x, 660, 290, 200, 28);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,107,145,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "600 22px system-ui, sans-serif";
    ctx.fillText(m.label, x + 28, 720);
    ctx.fillStyle = "#fff";
    ctx.font = "700 72px system-ui, sans-serif";
    ctx.fillText(m.value, x + 28, 810);
  });

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 32px system-ui, sans-serif";
  ctx.fillText(data.displayName, 72, 960);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("Logged in LIVV", 72, 1010);

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("evolvewithlivv.com", 72, h - 60);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/png");
  });
}

export async function shareOrDownloadBlob(blob: Blob, filename: string, title: string) {
  const file = new File([blob], filename, { type: "image/png" });
  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text: title });
      return "shared";
    } catch {
      // fall through
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
