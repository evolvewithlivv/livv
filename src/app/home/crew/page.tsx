import { Suspense } from "react";
import { CrewWorkspace } from "@/components/crew-workspace";
import { SkeletonScreen } from "@/components/motion/skeleton";

export default function CrewPage() {
  return (
    <Suspense fallback={<SkeletonScreen label="Loading crew" />}>
      <CrewWorkspace />
    </Suspense>
  );
}
