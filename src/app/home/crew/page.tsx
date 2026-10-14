import { Suspense } from "react";
import { CrewWorkspace } from "@/components/crew-workspace";

export default function CrewPage() {
  return (
    <Suspense fallback={<main className="crew" aria-hidden />}>
      <CrewWorkspace />
    </Suspense>
  );
}
