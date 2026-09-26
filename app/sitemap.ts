import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const pages = ["", "/players", "/server", "/map", "/stats", "/leaderboards", "/about", "/login"];
  return pages.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: p === "" ? 1 : 0.7,
  }));
}
