"use client";

import { useEffect } from "react";
import { consumeApexHandoff } from "@/lib/apex-handoff";

/** Starts the fragment handoff on every page, including public ones. */
export function ApexSessionHandoff() {
  useEffect(() => {
    void consumeApexHandoff();
  }, []);
  return null;
}
