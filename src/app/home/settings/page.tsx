"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Crown,
  Download,
  Fingerprint,
  LogOut,
  Trash2,
  Upload,
  UserRound,
  Volume2,
  Vibrate,
} from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import {
  loadIdentity,
  patchIdentity,
  saveIdentity,
  applyAppearance,
  APP_COLORS,
  type Appearance,
  type Identity,
  type LivvTheme,
} from "@/lib/identity";
import { syncIdentityToCloud, getCurrentAccount, signOut } from "@/lib/auth";
import { loadPrefs, type LivvPrefs } from "@/lib/prefs";
import { feedback } from "@/lib/sensory";
import {
  countManagedKeysPresent,
  deleteAllLivvData,
  downloadBackup,
  importBackup,
  parseBackupFile,
} from "@/lib/data-portability";
import { getTier, hasTier } from "@/lib/membership";
import { getEffectiveTier, startCheckout } from "@/lib/billing";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { deleteSupabaseAccount } from "@/lib/supabase/account-deletion";
import { linkEmailPasswordToCurrentUser } from "@/lib/supabase/link-account";
import { syncCloudMemberState } from "@/lib/supabase/cloud-state";

/** Single look picker: light/dark/system + named skins in one list. */
type LookOption = {
  id: string;
  label: string;
  hint: string;
  appearance: Appearance;
  theme: LivvTheme;
  /** Apex / Circle only */
  apexOnly?: boolean;
};

const LOOK_OPTIONS: LookOption[] = [
  {
    id: "device",
    label: "Device",
    hint: "Follow your system light or dark",
    appearance: "system",
    theme: "ember",
  },
  {
    id: "ember",
    label: "Ember",
    hint: "Warm dark — original LIVV",
    appearance: "dark",
    theme: "ember",
  },
  {
    id: "daylight",
    label: "Daylight",
    hint: "Clean light mode",
    appearance: "light",
    theme: "ember",
  },
  {
    id: "midnight",
    label: "Midnight",
    hint: "Deep, cool, quiet",
    appearance: "dark",
    theme: "midnight",
    apexOnly: true,
  },
  {
    id: "bone",
    label: "Bone",
    hint: "Warm, editorial light",
    appearance: "light",
    theme: "bone",
    apexOnly: true,
  },
];

const PAID_TIERS = ["rise", "apex", "circle"] as const;

function isLookActive(me: Identity, opt: LookOption): boolean {
  if (opt.id === "device") return me.appearance === "system";
  if (opt.id === "ember")
    return me.appearance === "dark" && (me.theme === "ember" || !me.theme);
  if (opt.id === "daylight")
    return me.appearance === "light" && (me.theme === "ember" || !me.theme);
  if (opt.id === "midnight")
    return me.appearance === "dark" && me.theme === "midnight";
  if (opt.id === "bone") return me.appearance === "light" && me.theme === "bone";
  return false;
}
