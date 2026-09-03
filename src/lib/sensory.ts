import { loadPrefs } from "./prefs";

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.04) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(a.destination);
  const now = a.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function haptic(style: "light" | "medium" | "success" = "light") {
  if (typeof window === "undefined") return;
  if (!loadPrefs().haptics) return;
  try {
    if (navigator.vibrate) {
      if (style === "light") navigator.vibrate(8);
      else if (style === "medium") navigator.vibrate(16);
      else navigator.vibrate([10, 30, 14]);
    }
  } catch {
    // ignore
  }
}

export function playSound(
  kind: "checkin" | "complete" | "unlock" | "tick" | "rest"
) {
  if (typeof window === "undefined") return;
  if (!loadPrefs().sound) return;
  try {
    if (kind === "checkin") {
      tone(420, 0.08, "sine", 0.035);
      setTimeout(() => tone(560, 0.12, "sine", 0.03), 70);
    } else if (kind === "complete") {
      tone(380, 0.1, "triangle", 0.04);
      setTimeout(() => tone(520, 0.14, "triangle", 0.035), 90);
      setTimeout(() => tone(660, 0.18, "sine", 0.03), 180);
    } else if (kind === "unlock") {
      tone(500, 0.1, "sine", 0.04);
      setTimeout(() => tone(750, 0.2, "sine", 0.035), 100);
    } else if (kind === "tick") {
      tone(880, 0.03, "square", 0.012);
    } else if (kind === "rest") {
      tone(300, 0.12, "sine", 0.04);
      setTimeout(() => tone(300, 0.12, "sine", 0.03), 160);
    }
  } catch {
    // ignore
  }
}

export function feedback(
  kind: "checkin" | "complete" | "unlock" | "tick" | "rest"
) {
  if (kind === "checkin" || kind === "complete" || kind === "unlock") haptic("success");
  else if (kind === "rest") haptic("medium");
  else haptic("light");
  playSound(kind);
}
