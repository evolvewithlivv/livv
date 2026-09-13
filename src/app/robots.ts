import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/home", "/auth", "/onboarding", "/api", "/_next/"],
    },
    sitemap: "https://evolvewithlivv.com/sitemap.xml",
  };
}
