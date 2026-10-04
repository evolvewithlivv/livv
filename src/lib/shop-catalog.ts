/**
 * LIVV Collection 001 — product catalog mirrored from Shopify.
 * Buy URLs point at the Shopify storefront. Domain must NOT conflict
 * with the Next app (Shopify primary domain should be myshopify or shop.*).
 */

export const SHOPIFY_STORE_URL = "https://n8tv6p-pu.myshopify.com";

export type ShopOption = {
  id: string;
  label: string;
};

export type ShopProduct = {
  handle: string;
  name: string;
  price: string;
  priceCents: number;
  image: string;
  description: string;
  options: {
    name: string;
    values: ShopOption[];
  }[];
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    handle: "men-s-premium-heavyweight-tee-1",
    name: "LIVV Heavyweight Tee - White Logo",
    price: "From $39.95",
    priceCents: 3995,
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-black-front-6ac2572409a64.png?v=1791121207",
    description: "Premium heavyweight cotton. White LIVV mark. Made to order.",
    options: [
      {
        name: "Size",
        values: [
          { id: "s", label: "S" },
          { id: "m", label: "M" },
          { id: "l", label: "L" },
          { id: "xl", label: "XL" },
          { id: "2xl", label: "2XL" },
        ],
      },
    ],
  },
  {
    handle: "men-s-premium-heavyweight-tee",
    name: "LIVV Heavyweight Tee - Black Logo",
    price: "From $39.95",
    priceCents: 3995,
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-white-front-6ac256bda7240.png?v=1791121101",
    description: "Premium heavyweight cotton. Black LIVV mark. Made to order.",
    options: [
      {
        name: "Size",
        values: [
          { id: "s", label: "S" },
          { id: "m", label: "M" },
          { id: "l", label: "L" },
          { id: "xl", label: "XL" },
          { id: "2xl", label: "2XL" },
        ],
      },
    ],
  },
  {
    handle: "mens-heavyweight-long-sleeve-t-shirt-1",
    name: "LIVV Heavyweight Long Sleeve - White Logo",
    price: "From $44.95",
    priceCents: 4495,
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-black-front-6ac2573c45416.png?v=1791121222",
    description: "Heavyweight long sleeve. White LIVV mark. Made to order.",
    options: [
      {
        name: "Size",
        values: [
          { id: "s", label: "S" },
          { id: "m", label: "M" },
          { id: "l", label: "L" },
          { id: "xl", label: "XL" },
          { id: "2xl", label: "2XL" },
        ],
      },
    ],
  },
  {
    handle: "mens-heavyweight-long-sleeve-t-shirt",
    name: "LIVV Heavyweight Long Sleeve - Black Logo",
    price: "From $44.95",
    priceCents: 4495,
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-white-front-6ac256f65cc22.png?v=1791121157",
    description: "Heavyweight long sleeve. Black LIVV mark. Made to order.",
    options: [
      {
        name: "Size",
        values: [
          { id: "s", label: "S" },
          { id: "m", label: "M" },
          { id: "l", label: "L" },
          { id: "xl", label: "XL" },
          { id: "2xl", label: "2XL" },
        ],
      },
    ],
  },
  {
    handle: "tough-case-for-iphone",
    name: "LIVV Tough iPhone Case",
    price: "$34.95",
    priceCents: 3495,
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/tough-case-for-iphone-matte-iphone-17-pro-max-front-6ac255eaa6549.png?v=1791120889",
    description: "Protective tough case with LIVV mark. Select your model at checkout.",
    options: [
      {
        name: "Model",
        values: [
          { id: "iphone-15", label: "iPhone 15" },
          { id: "iphone-15-pro", label: "iPhone 15 Pro" },
          { id: "iphone-15-pro-max", label: "iPhone 15 Pro Max" },
          { id: "iphone-16", label: "iPhone 16" },
          { id: "iphone-16-pro", label: "iPhone 16 Pro" },
          { id: "iphone-16-pro-max", label: "iPhone 16 Pro Max" },
          { id: "iphone-17-pro-max", label: "iPhone 17 Pro Max" },
        ],
      },
    ],
  },
];

export function getProduct(handle: string): ShopProduct | undefined {
  const normalized = decodeURIComponent(handle)
    .replace(/®/g, "")
    .replace(/\u00ae/g, "")
    .toLowerCase();
  return SHOP_PRODUCTS.find(
    (p) =>
      p.handle === handle ||
      p.handle === normalized ||
      normalized.startsWith(p.handle)
  );
}

export function shopifyProductUrl(handle: string): string {
  // iPhone case handle may include special chars on Shopify
  if (handle.startsWith("tough-case")) {
    return `${SHOPIFY_STORE_URL}/products/tough-case-for-iphone%C2%AE`;
  }
  return `${SHOPIFY_STORE_URL}/products/${handle}`;
}
