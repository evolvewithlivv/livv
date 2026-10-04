import { BottomNav } from "@/components/layout/bottom-nav";
import { RequireAuth } from "@/components/auth/require-auth";
import { MilestoneCeremony } from "@/components/gamification/milestone-ceremony";
import { PageMotion } from "@/components/layout/page-motion";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      {/*
        Flex shell — tab bar is in normal flow at the bottom of 100dvh.
        Header removed for a full-bleed experience; pages handle safe-area-top.
      */}
      <div className="livv-app-shell flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-livv-bg">
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <PageMotion>{children}</PageMotion>
        </div>
        <BottomNav />
        <MilestoneCeremony />
      </div>
    </RequireAuth>
  );
}
