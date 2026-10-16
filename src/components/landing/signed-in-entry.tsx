"use client";

import { useEffect } from "react";
import { isOnboardingComplete, markOnboardingComplete } from "@/lib/onboarding";
import { isCloudOnboardingComplete } from "@/lib/supabase/onboarding-state";
import { getAuthenticatedUser } from "@/lib/supabase/real-auth";

/**
 * Resolves the held landing state: a real session exists, but local
 * onboarding is not marked complete. Same branch as the auth screen.
 */
export function LandingSignedInEntry() {
  useEffect(() => {
    if (document.documentElement.getAttribute("data-livv-landing-hold") !== "1") return;
    let cancelled = false;

    const enter = async () => {
      try {
        const user = await getAuthenticatedUser();
        if (cancelled) return;
        if (!user || user.is_anonymous || !user.email) {
          document.documentElement.removeAttribute("data-livv-landing-hold");
          return;
        }
        if (isOnboardingComplete()) {
          window.location.replace("/home");
          return;
        }
        let cloudComplete = false;
        try {
          cloudComplete = await isCloudOnboardingComplete();
        } catch {
          cloudComplete = false;
        }
        if (cancelled) return;
        if (cloudComplete) {
          markOnboardingComplete();
          window.location.replace("/home");
          return;
        }
        window.location.replace("/onboarding");
      } catch {
        if (!cancelled) document.documentElement.removeAttribute("data-livv-landing-hold");
      }
    };

    void enter();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
