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

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.025, delay = 0) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  const filter = a.createBiquadFilter();
  osc.type = type;
  osc.frequency.value = freq;
  filter.type = "lowpass";
  filter.frequency.value = 2600;
  filter.Q.value = 0.35;
  osc.connect(filter);
  filter.connect(g);
  g.connect(a.destination);
  const now = a.currentTime + delay;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration + 0.03);
}

function successChord() {
  tone(523.25, 0.16, "sine", 0.026);
  tone(659.25, 0.18, "sine", 0.021, 0.045);
  tone(783.99, 0.24, "sine", 0.018, 0.09);
}



export type HapticStyle = "light" | "medium" | "success";

/**
 * Fire haptic feedback.
 * - Native (Capacitor iOS/Android): Taptic / vibrator via @capacitor/haptics
 * - Web Android: navigator.vibrate fallback
 * - Web iOS Safari: no-op (platform does not expose Vibration API)
 * Always respects Settings → haptics.
 * Sync API — native work is fire-and-forget so call sites stay unchanged.
 */
export function haptic(style: HapticStyle = "light") {
  if (typeof window === "undefined") return;
  if (!loadPrefs().haptics) return;
  void runHaptic(style);
}

async function runHaptic(style: HapticStyle) {
  try {
    const native = await tryNativeHaptic(style);
    if (native) return;

    // Web fallback (Android Chrome / some desktop)
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      if (style === "light") navigator.vibrate(8);
      else if (style === "medium") navigator.vibrate(16);
      else navigator.vibrate([10, 30, 14]);
    }
  } catch {
    // never block UI on sensory failure
  }
}

async function tryNativeHaptic(style: HapticStyle): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return false;

    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");

    if (style === "success") {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (style === "medium") {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    return true;
  } catch {
    return false;
  }
}

export function playSound(
  kind: "checkin" | "complete" | "unlock" | "tick" | "rest"
) {
  if (typeof window === "undefined") return;
  if (!loadPrefs().sound) return;
  try {
    if (kind === "checkin") {
      tone(392, 0.11, "sine", 0.018);
      tone(587.33, 0.18, "sine", 0.015, 0.055);
    } else if (kind === "complete") {
      successChord();
    } else if (kind === "unlock") {
      tone(659.25, 0.13, "sine", 0.02);
      tone(987.77, 0.22, "sine", 0.016, 0.07);
    } else if (kind === "tick") {
      tone(740, 0.028, "sine", 0.008);
    } else if (kind === "rest") {
      tone(329.63, 0.14, "sine", 0.018);
      tone(246.94, 0.16, "sine", 0.012, 0.12);
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
