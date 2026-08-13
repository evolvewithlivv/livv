import { Container } from "@/components/ui/container";

export default function ProgressPage() {
  return (
    <main className="pt-8">
      <Container>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="mt-2 text-livv-muted text-sm leading-relaxed">
          Track growth across body, mind, and identity.
        </p>

        <div className="mt-10 rounded-2xl border border-livv-border bg-livv-surface p-8 text-center">
          <p className="text-sm text-livv-muted">
            Progress tracking coming soon.
          </p>
          <p className="mt-2 text-xs text-white/30">
            This is a conceptual placeholder.
          </p>
        </div>
      </Container>
    </main>
  );
}