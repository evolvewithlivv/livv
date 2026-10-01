"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Articles removed — any deep link returns to Mind doorway. */
export default function MindArticleRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home/mind");
  }, [router]);
  return <main className="min-h-dvh" />;
}
