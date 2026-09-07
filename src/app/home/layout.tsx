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
      <div className="relative min-h-[100dvh] overflow-hidden bg-transparent">
        <div className="min-h-[100dvh] overflow-y-auto overscroll-y-contain pb-28 [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
        <BottomNav />
        <MilestoneCeremony />
      </div>
    </RequireAuth>
  );
}
