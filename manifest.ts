import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "A-MATH ARENA",
    short_name: "A-MATH",
    description: "International competitive mathematical strategy game.",
    start_url: "/",
    display: "standalone",
    background_color: "#101827",
    theme_color: "#101827",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
