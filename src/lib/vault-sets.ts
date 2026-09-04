/** Card sets — collect with meaning. */

import { CARD_CATALOG, loadPacks } from "./packs";

export type VaultSet = {
  id: string;
  name: string;
  pillar: string;
  cardIds: string[];
};

export const VAULT_SETS: VaultSet[] = [
  {
    id: "set_body",
    name: "Body Proof",
    pillar: "Body",
    cardIds: CARD_CATALOG.filter((c) => c.pillar === "Body").map((c) => c.id),
  },
  {
    id: "set_mind",
    name: "Quiet Mind",
    pillar: "Mind",
    cardIds: CARD_CATALOG.filter((c) => c.pillar === "Mind").map((c) => c.id),
  },
  {
    id: "set_life",
    name: "The Line",
    pillar: "Life",
    cardIds: CARD_CATALOG.filter((c) => c.pillar === "Life").map((c) => c.id),
  },
  {
    id: "set_career",
    name: "Deep Work",
    pillar: "Career",
    cardIds: CARD_CATALOG.filter((c) => c.pillar === "Career").map((c) => c.id),
  },
  {
    id: "set_finance",
    name: "The Ledger",
    pillar: "Finance",
    cardIds: CARD_CATALOG.filter((c) => c.pillar === "Finance").map((c) => c.id),
  },
  {
    id: "set_social",
    name: "Real Reach",
    pillar: "Social",
    cardIds: CARD_CATALOG.filter((c) => c.pillar === "Social").map((c) => c.id),
  },
];

export function setProgress() {
  const owned = new Set(loadPacks().owned.map((o) => o.cardId));
  return VAULT_SETS.map((s) => {
    const have = s.cardIds.filter((id) => owned.has(id)).length;
    return {
      ...s,
      have,
      total: s.cardIds.length,
      complete: s.cardIds.length > 0 && have >= s.cardIds.length,
    };
  });
}
