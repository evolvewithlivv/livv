"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Download, Share, X } from "lucide-react";

type DeferredPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function InstallApp() {
  const [ready, setReady] = useState(false);
  const [ios, setIos] = useState(false);
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<DeferredPrompt | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    setReady(true);
    setIos(isIOS());
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as DeferredPrompt);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!ready) return null;

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice.catch(() => null);
      setDeferred(null);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-livv-border bg-livv-surface px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-livv-fg transition active:scale-[0.97]"
        aria-label="Install LIVV as an app"
      >
        <Download size={12} strokeWidth={2} />
        Install
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="install-title">
          <div className="w-full max-w-md rounded-[30px] border border-white/15 bg-[rgb(var(--livv-surface))] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-livv-accent">LIVV app</p>
                <h2 id="install-title" className="font-display mt-2 text-[25px] font-semibold tracking-tight text-livv-fg">Put LIVV on your home screen.</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-livv-muted">Open LIVV like a normal app, without typing the website every time.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted" aria-label="Close install instructions">
                <X size={17} />
              </button>
            </div>

            {ios ? (
              <div className="mt-5 space-y-3">
                <Step number="1" title="Tap Share" text="In Safari, tap the Share button at the bottom of the screen." icon={<Share size={17} />} />
                <Step number="2" title="Choose Add to Home Screen" text="Scroll the Share menu if you need to find it, then tap Add to Home Screen." />
                <Step number="3" title="Tap Add" text="Keep the name LIVV, then tap Add. LIVV will appear beside your other apps." />
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <Step number="1" title="Open your browser menu" text="Use the browser menu or install icon near the address bar." icon={<Download size={17} />} />
                <Step number="2" title="Choose Install app" text="Select Install LIVV or Add to Home screen." />
                <Step number="3" title="Confirm" text="Accept the prompt. LIVV will open from your home screen like an app." />
              </div>
            )}

            <button type="button" onClick={() => setOpen(false)} className="mt-5 w-full rounded-full bg-livv-accent py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ number, title, text, icon }: { number: string; title: string; text: string; icon?: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-livv-border bg-livv-bg p-3.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-livv-border text-[11px] font-semibold text-livv-fg">{icon ?? number}</span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-livv-fg">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-livv-muted">{text}</p>
      </div>
    </div>
  );
}
