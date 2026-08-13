import { BottomNav } from "@/components/layout/bottom-nav";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-livv-black pb-24">
      {children}
      <BottomNav />
    </div>
  );
}