"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { RequireAuth } from "@/components/auth/require-auth";
import { MilestoneCeremony } from "@/components/gamification/milestone-ceremony";
import { PageMotion } from "@/components/layout/page-motion";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Recipes are an intentionally public, shareable resource. Keep the exact
  // existing URL working for links shared outside the signed-in app.
  if (pathname === "/home/health/recipes") {
    return <PageMotion>{children}</PageMotion>;
  }

  return (
    <div className="livv-app-shell flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-livv-bg">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <RequireAuth>
          <PageMotion>{children}</PageMotion>
          <MilestoneCeremony />
        </RequireAuth>
      </div>
      <BottomNav />
    </div>
  );
}
