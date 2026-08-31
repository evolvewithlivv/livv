import { BottomNav } from "@/components/layout/bottom-nav";
import { ThemeShell } from "@/components/layout/theme-shell";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeShell>
      {children}
      <BottomNav />
    </ThemeShell>
  );
}
