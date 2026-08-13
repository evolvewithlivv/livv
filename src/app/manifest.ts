import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LIVV",
    short_name: "LIVV",
    description: "Personal evolution ecosystem",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      {
        src: "/api/icon?s=180",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/icon?s=180",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/icon?s=180",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
