import { BottomNav } from "@/components/layout/bottom-nav";
import { RequireAuth } from "@/components/auth/require-auth";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex h-[100dvh] flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {children}
        </div>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
