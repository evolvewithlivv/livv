import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "LIVV",
    short_name: "LIVV",
    description: "Evolve. Train. Connect. Progress.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#030405",
    theme_color: "#030405",
    categories: ["health", "lifestyle", "fitness"],
    icons: [
      {
        src: "/api/icon?s=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/api/icon?s=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/api/icon?s=180",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
