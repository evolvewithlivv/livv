import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://evolvewithlivv.com";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/legal/terms`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/privacy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/refunds`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
