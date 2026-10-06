"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy Canon route — V1 routes Mind work through Daily. */
export default function CanonRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home/daily");
  }, [router]);
  return null;
}
