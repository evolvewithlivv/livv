"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LabRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home/mind");
  }, [router]);
  return <main className="min-h-dvh bg-[#050505]" />;
}
