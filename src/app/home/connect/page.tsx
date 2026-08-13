import { Container } from "@/components/ui/container";

export default function ConnectPage() {
  return (
    <main className="pt-8">
      <Container>
        <h1 className="text-2xl font-bold tracking-tight">Connect</h1>
        <p className="mt-2 text-livv-muted text-sm leading-relaxed">
          Community, relationships, and shared progress.
        </p>

        <div className="mt-10 rounded-2xl border border-livv-border bg-livv-surface p-8 text-center">
          <p className="text-sm text-livv-muted">
            Connection features coming soon.
          </p>
          <p className="mt-2 text-xs text-white/30">
            This is a conceptual placeholder.
          </p>
        </div>
      </Container>
    </main>
  );
}