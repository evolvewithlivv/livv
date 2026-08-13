import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <Container>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            LIVV
          </h1>
          <p className="mt-3 text-neutral-500 text-sm sm:text-base">
            Foundation ready
          </p>
        </div>
      </Container>
    </main>
  );
}