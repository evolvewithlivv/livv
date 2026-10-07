export type MarketingEmailCompliance = {
  postalAddress: string;
  unsubscribeUrl: string;
};

export function requireMarketingEmailCompliance(input: Partial<MarketingEmailCompliance>): MarketingEmailCompliance {
  const postalAddress = String(input.postalAddress || "").trim();
  const unsubscribeUrl = String(input.unsubscribeUrl || "").trim();

  if (!postalAddress) {
    throw new Error("Marketing email requires a valid physical postal address.");
  }
  if (!unsubscribeUrl || !/^https:\/\//i.test(unsubscribeUrl)) {
    throw new Error("Marketing email requires a working HTTPS unsubscribe URL.");
  }

  return { postalAddress, unsubscribeUrl };
}

export function marketingEmailFooter(input: MarketingEmailCompliance): string {
  const safe = requireMarketingEmailCompliance(input);
  return [
    "Evolve With LIVV",
    safe.postalAddress,
    `Unsubscribe: ${safe.unsubscribeUrl}`,
  ].join("\n");
}
