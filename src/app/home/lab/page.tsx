"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy Lab route — V1 routes Mind work through Daily. */
export default function LabRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home/daily");
  }, [router]);
  return null;
}
