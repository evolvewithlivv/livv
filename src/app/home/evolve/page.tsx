"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Evolve tab is now Evala — permanent redirect. */
export default function EvolveRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home/evala");
  }, [router]);
  return <main className="min-h-dvh bg-[#050505]" />;
}
