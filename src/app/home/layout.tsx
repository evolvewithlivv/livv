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
          <footer className="livv-brand-footer" aria-label="LIVV">
            {/* Official LIVV Pillars logo. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/share-backgrounds/LIVV%20Pillars%20Logo%20-%20BLACK.PNG"
              alt="LIVV pillars"
              className="livv-footer-logo livv-footer-logo-light"
              draggable={false}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/share-backgrounds/LIVV%20Pillars%20Logo%20-%20WHITE.PNG"
              alt=""
              aria-hidden="true"
              className="livv-footer-logo livv-footer-logo-dark"
              draggable={false}
            />
          </footer>
        </div>
        <BottomNav />
        <MilestoneCeremony />
      </div>
    </RequireAuth>
  );
}
