/**
 * Product checkout links stay off until the Shopify store is published.
 * Set NEXT_PUBLIC_SHOP_LINKS_ENABLED=true to restore the existing product URLs.
 * Anything other than the string "true" stays off, including an unset variable.
 */
export const SHOP_LINKS_ENABLED =
  process.env.NEXT_PUBLIC_SHOP_LINKS_ENABLED === "true";
