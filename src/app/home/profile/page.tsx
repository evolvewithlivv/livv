import { Container } from "@/components/ui/container";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="pt-8">
      <Container>
        <div className="flex items-center gap-4 mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-livv-border bg-livv-surface text-xl font-semibold">
            L
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-sm text-livv-muted mt-0.5">LIVV Member</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-livv-border bg-livv-surface p-4">
            <p className="text-xs text-livv-muted uppercase tracking-wider">
              Identity
            </p>
            <p className="mt-1 text-sm text-white/80">
              Profile details will live here once accounts are connected.
            </p>
          </div>

          <div className="rounded-2xl border border-livv-border bg-livv-surface p-4">
            <p className="text-xs text-livv-muted uppercase tracking-wider">
              LIVV+
            </p>
            <p className="mt-1 text-sm text-white/80">
              Premium membership and products will appear here.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm text-livv-muted hover:text-white transition-colors"
          >
            ← Back to opening
          </Link>
        </div>
      </Container>
    </main>
  );
}