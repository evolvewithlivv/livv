"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const canContinue =
    (step === "why" && why.trim().length > 2) ||
    (step === "goals" && selectedGoals.length > 0) ||
    (step === "interests" && selectedInterests.length > 0) ||
    (step === "profile" && displayName.trim().length > 1);

  const handleNext = () => {
    if (step === "why") setStep("goals");
    else if (step === "goals") setStep("interests");
    else if (step === "interests") setStep("profile");
    else router.push("/home");
  };

  return (
    <main className="min-h-dvh bg-livv-black flex flex-col">
      {/* Progress */}
      <div className="px-5 pt-6 pb-2">
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

      <div className="flex-1 flex flex-col px-5 pt-8 pb-8 max-w-lg mx-auto w-full">
        {step === "why" && (
          <div className="animate-fade-in flex-1 flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">
              Why are you here?
            </h1>
            <p className="mt-2 text-livv-muted text-sm leading-relaxed">
              One sentence is enough. This helps LIVV understand your direction.
            </p>
            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="I want to become more disciplined and consistent..."
              className="mt-8 w-full flex-1 min-h-[140px] rounded-2xl border border-livv-border bg-livv-surface px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-livv-accent/40 resize-none text-base"
              maxLength={200}
            />
          </div>
        )}

        {step === "goals" && (
          <div className="animate-fade-in flex-1 flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">
              What do you want to accomplish?
            </h1>
            <p className="mt-2 text-livv-muted text-sm">
              Select everything that resonates.
            </p>
            <div className="mt-8 space-y-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "w-full text-left rounded-2xl border px-4 py-4 transition-all duration-200",
                    selectedGoals.includes(goal.id)
                      ? "border-livv-accent bg-livv-accent/10 text-white"
                      : "border-livv-border bg-livv-surface text-white/80 hover:border-white/20"
                  )}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "interests" && (
          <div className="animate-fade-in flex-1 flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">
              What are you into?
            </h1>
            <p className="mt-2 text-livv-muted text-sm">
              Pick the areas that excite you.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
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
          <div className="animate-fade-in flex-1 flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">
              Create your LIVV identity
            </h1>
            <p className="mt-2 text-livv-muted text-sm">
              Just a display name for now. You can refine everything later.
            </p>
            <div className="mt-10">
              <label className="text-xs text-livv-muted uppercase tracking-wider">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should people know you?"
                className="mt-2 w-full rounded-2xl border border-livv-border bg-livv-surface px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-livv-accent/40 text-base"
                maxLength={32}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-10 flex gap-3">
          {step !== "why" && (
            <Button
              variant="ghost"
              className="flex-1"
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
            disabled={!canContinue}
            onClick={handleNext}
          >
            {step === "profile" ? "Enter LIVV" : "Continue"}
          </Button>
        </div>
      </div>
    </main>
  );
}