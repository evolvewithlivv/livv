import { BottomNav } from "@/components/layout/bottom-nav";
import { RequireAuth } from "@/components/auth/require-auth";
import { MilestoneCeremony } from "@/components/gamification/milestone-ceremony";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--livv-bg)]">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
        <BottomNav />
        <MilestoneCeremony />
      </div>
    </RequireAuth>
  );
}
