"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeDeviceOnboarding, isSignedInLocal } from "@/lib/auth";
import {
  loadOnboardingDraft,
  markFirstSessionPending,
  markOnboardingComplete,
  saveOnboardingDraft,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: "fitness", label: "Get stronger & leaner" },
  { id: "mindset", label: "Build better habits" },
  { id: "identity", label: "Define who I want to become" },
  { id: "community", label: "Connect with like-minded people" },
  { id: "progress", label: "Track my growth over time" },
  { id: "premium", label: "Access premium tools & products" },
];

const INTERESTS = [
  "Training", "Nutrition", "Mindset", "Recovery",
  "Style", "Longevity", "Discipline", "Community",
];

type Step = "why" | "goals" | "interests" | "profile";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("why");
  const [why, setWhy] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = loadOnboardingDraft();
    if (draft.why) setWhy(draft.why);
    if (draft.goals.length) setSelectedGoals(draft.goals);
    if (draft.interests.length) setSelectedInterests(draft.interests);
    if (draft.displayName) setDisplayName(draft.displayName);
    // Local product session only — cloud anon alone must not skip onboarding (A3-3).
    if (isSignedInLocal() && draft.completedAt) {
      router.replace("/home");
    }
  }, [router]);

  const persist = (partial: {
    why?: string;
    goals?: string[];
    interests?: string[];
    displayName?: string;
  }) => {
    saveOnboardingDraft(partial);
  };

  const toggle = (list: string[], id: string, set: (v: string[]) => void) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const finish = async () => {
    const name = displayName.trim();
    if (!name) {
      setError("Add a display name to continue.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      persist({ why, goals: selectedGoals, interests: selectedInterests, displayName: name });
      markOnboardingComplete();
      markFirstSessionPending();
      await completeDeviceOnboarding({ displayName: name });
      router.replace("/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not finish onboarding");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="livv-page relative min-h-dvh overflow-hidden pb-16 pt-10 text-white">
      <div className="relative z-10 mx-auto max-w-md px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-livv-accent-soft">
          Onboarding
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          {step === "why" && "Why are you here?"}
          {step === "goals" && "What are you building?"}
          {step === "interests" && "What pulls you in?"}
          {step === "profile" && "What should we call you?"}
        </h1>

        {step === "why" && (
          <div className="mt-8">
            <textarea
              value={why}
              onChange={(e) => {
                setWhy(e.target.value);
                persist({ why: e.target.value });
              }}
              rows={5}
              placeholder="One honest sentence."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/25 focus:border-white/25"
            />
            <Button
              className="mt-6 w-full"
              onClick={() => setStep("goals")}
            >
              Continue
            </Button>
          </div>
        )}

        {step === "goals" && (
          <div className="mt-8 space-y-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  const next = selectedGoals.includes(g.id)
                    ? selectedGoals.filter((x) => x !== g.id)
                    : [...selectedGoals, g.id];
                  setSelectedGoals(next);
                  persist({ goals: next });
                }}
                className={cn(
                  "flex w-full items-center rounded-2xl border px-4 py-3.5 text-left text-[14px] transition",
                  selectedGoals.includes(g.id)
                    ? "border-livv-accent/50 bg-livv-accent/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/70"
                )}
              >
                {g.label}
              </button>
            ))}
            <div className="flex gap-2 pt-4">
              <Button variant="ghost" className="flex-1" onClick={() => setStep("why")}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep("interests")}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "interests" && (
          <div className="mt-8">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    const next = selectedInterests.includes(label)
                      ? selectedInterests.filter((x) => x !== label)
                      : [...selectedInterests, label];
                    setSelectedInterests(next);
                    persist({ interests: next });
                  }}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[12px] font-medium transition",
                    selectedInterests.includes(label)
                      ? "border-white/30 bg-white text-black"
                      : "border-white/10 bg-white/[0.03] text-white/60"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStep("goals")}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep("profile")}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "profile" && (
          <div className="mt-8">
            <input
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                persist({ displayName: e.target.value });
              }}
              placeholder="Display name"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-white/25 focus:border-white/25"
            />
            {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}
            <div className="mt-6 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStep("interests")}>
                Back
              </Button>
              <Button className="flex-1" disabled={busy} onClick={() => void finish()}>
                {busy ? "Entering…" : "Enter LIVV"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
