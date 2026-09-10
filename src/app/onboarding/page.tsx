"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeDeviceOnboarding, isSignedIn } from "@/lib/auth";
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
    // Returning signed-in users who already finished onboarding go Home.
    if (isSignedIn() && draft.completedAt) {
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

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => {
      const next = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
      persist({ goals: next });
      return next;
    });
  };

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) => {
      const next = prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label];
      persist({ interests: next });
      return next;
    });
  };

  const canContinue =
    (step === "why" && why.trim().length > 2) ||
    (step === "goals" && selectedGoals.length > 0) ||
    (step === "interests" && selectedInterests.length > 0) ||
    (step === "profile" && displayName.trim().length > 1);

  const handleNext = async () => {
    setError("");
    if (step === "why") {
      persist({ why: why.trim() });
      setStep("goals");
      return;
    }
    if (step === "goals") {
      persist({ goals: selectedGoals });
      setStep("interests");
      return;
    }
    if (step === "interests") {
      persist({ interests: selectedInterests });
      setStep("profile");
      return;
    }

    // Final step: persist draft, open local session, enter Home.
    setBusy(true);
    try {
      const name = displayName.trim();
      persist({ displayName: name, why: why.trim(), goals: selectedGoals, interests: selectedInterests });
      await completeDeviceOnboarding({ displayName: name });
      markOnboardingComplete();
      markFirstSessionPending();
      router.replace("/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start your session");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-livv-black">
      <div className="px-5 pb-2 pt-6">
        <div className="flex gap-1.5">
          {(["why", "goals", "interests", "profile"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= ["why", "goals", "interests", "profile"].indexOf(step)
                  ? "bg-livv-accent"
                  : "bg-livv-border"
              )}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-8 pt-8">
        {step === "why" && (
          <div className="flex flex-1 animate-fade-in flex-col">
            <h1 className="font-display text-[2.15rem] leading-tight">
              Why are you here?
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              One sentence is enough. This helps LIVV understand your direction.
            </p>
            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              onBlur={() => persist({ why: why.trim() })}
              placeholder="I want to become more disciplined and consistent..."
              className="mt-8 min-h-[140px] w-full flex-1 resize-none rounded-2xl border border-livv-border bg-livv-surface px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-livv-accent/40"
              maxLength={200}
            />
          </div>
        )}

        {step === "goals" && (
          <div className="flex flex-1 animate-fade-in flex-col">
            <h1 className="font-display text-[2.15rem] leading-tight">
              What do you want to accomplish?
            </h1>
            <p className="mt-3 text-sm text-white/45">
              Select everything that resonates.
            </p>
            <div className="mt-8 space-y-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                    selectedGoals.includes(goal.id)
                      ? "border-livv-accent bg-livv-accent/15 text-white"
                      : "border-livv-border bg-livv-surface text-white/70 hover:border-white/20"
                  )}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "interests" && (
          <div className="flex flex-1 animate-fade-in flex-col">
            <h1 className="font-display text-[2.15rem] leading-tight">
              What are you into?
            </h1>
            <p className="mt-3 text-sm text-white/45">
              We’ll use this to shape what you see first.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-sm transition-all duration-200",
                    selectedInterests.includes(interest)
                      ? "border-livv-accent bg-livv-accent/15 text-white"
                      : "border-livv-border bg-livv-surface text-white/70 hover:border-white/20"
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "profile" && (
          <div className="flex flex-1 animate-fade-in flex-col">
            <h1 className="font-display text-[2.15rem] leading-tight">
              Create your LIVV identity
            </h1>
            <p className="mt-3 text-sm text-white/45">
              Display name only. Your session stays on this device — not cloud login.
            </p>
            <div className="mt-10">
              <label className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={() => persist({ displayName: displayName.trim() })}
                placeholder="How should people know you?"
                className="mt-2 w-full rounded-2xl border border-livv-border bg-livv-surface px-4 py-3.5 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-livv-accent/40"
                maxLength={32}
              />
            </div>
            {error && (
              <p className="mt-4 text-sm text-red-400/90">{error}</p>
            )}
          </div>
        )}

        <div className="mt-10 flex gap-3">
          {step !== "why" && (
            <Button
              variant="ghost"
              className="flex-1"
              disabled={busy}
              onClick={() => {
                if (step === "goals") setStep("why");
                else if (step === "interests") setStep("goals");
                else if (step === "profile") setStep("interests");
              }}
            >
              Back
            </Button>
          )}
          <Button
            variant="accent"
            className="flex-1"
            disabled={!canContinue || busy}
            onClick={() => void handleNext()}
          >
            {busy ? "Starting…" : step === "profile" ? "Enter LIVV" : "Continue"}
          </Button>
        </div>
      </div>
    </main>
  );
}
