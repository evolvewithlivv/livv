import { BottomNav } from "@/components/layout/bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { RequireAuth } from "@/components/auth/require-auth";
import { MilestoneCeremony } from "@/components/gamification/milestone-ceremony";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      {/*
        Flex shell — tab bar is in normal flow at the bottom of 100dvh.
        Avoids iOS Safari bugs where position:fixed jumps during overscroll / address-bar resize.
      */}
      <div className="livv-app-shell flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-livv-bg">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <AppHeader />
          {children}
        </div>
        <BottomNav />
        <MilestoneCeremony />
      </div>
    </RequireAuth>
  );
}
