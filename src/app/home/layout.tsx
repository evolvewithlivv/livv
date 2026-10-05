import { BottomNav } from "@/components/layout/bottom-nav";
import { RequireAuth } from "@/components/auth/require-auth";
import { MilestoneCeremony } from "@/components/gamification/milestone-ceremony";
import { PageMotion } from "@/components/layout/page-motion";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      {/*
        Full-bleed shell — content extends under the status bar (Instagram-style).
        Pages / main apply safe-area padding so text stays readable.
        Tab bar keeps safe-area-inset-bottom.
      */}
      <div className="livv-app-shell flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-livv-bg">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <PageMotion>{children}</PageMotion>
        </div>
        <BottomNav />
        <MilestoneCeremony />
      </div>
    </RequireAuth>
  );
}
