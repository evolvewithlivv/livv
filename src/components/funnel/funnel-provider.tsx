"use client";

import { useEffect } from "react";
import { initFunnel } from "@/lib/funnel";

export function FunnelProvider() {
  useEffect(() => {
    initFunnel();
  }, []);
  return null;
}
