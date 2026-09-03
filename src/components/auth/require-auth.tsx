"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSignedIn } from "@/lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!isSignedIn()) {
      router.replace("/auth");
      return;
    }
    setOk(true);
  }, [router]);

  if (!ok) {
    return <div className="min-h-dvh bg-livv-black" />;
  }

  return <>{children}</>;
}
