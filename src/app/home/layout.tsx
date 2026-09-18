import { BottomNav } from "@/components/layout/bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { RequireAuth } from "@/components/auth/require-auth";
import { MilestoneCeremony } from "@/components/gamification/milestone-ceremony";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="livv-app-shell min-h-[100dvh] bg-livv-bg">
        <div className="min-h-[100dvh] overflow-y-auto overscroll-y-contain pb-28 [-webkit-overflow-scrolling:touch]">
          <AppHeader />
          {children}
        </div>
        <BottomNav />
        <MilestoneCeremony />
      </div>
    </RequireAuth>
  );
}
