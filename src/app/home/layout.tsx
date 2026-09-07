import { BottomNav } from "@/components/layout/bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { AmbientField } from "@/components/layout/ambient-field";
import { RequireAuth } from "@/components/auth/require-auth";
import { MilestoneCeremony } from "@/components/gamification/milestone-ceremony";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="livv-app-shell relative min-h-[100dvh] overflow-hidden bg-livv-bg">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-livv-bg" />
          <AmbientField intensity="strong" />
          <div className="livv-grain opacity-[0.04]" />
        </div>
        <div className="relative z-10 min-h-[100dvh] overflow-y-auto overscroll-y-contain pb-28 [-webkit-overflow-scrolling:touch]">
          <AppHeader />
          {children}
        </div>
        <BottomNav />
        <MilestoneCeremony />
      </div>
    </RequireAuth>
  );
}
