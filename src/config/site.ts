export const siteConfig = {
  name: "MangoZ SMP",
  shortName: "MangoZ",
  tagline: "Your world. Your story. Your SMP.",
  description:
    "MangoZ SMP is a community-driven Minecraft survival server with custom gameplay, economy, events, and crossplay.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mangoz-smp.pages.dev",
  links: {
    discord: process.env.NEXT_PUBLIC_DISCORD_URL ?? "",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "",
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL ?? "",
    website: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mangoz-smp.pages.dev",
    map: process.env.NEXT_PUBLIC_MAP_URL ?? "",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Players", href: "/players" },
    { label: "Server", href: "/server" },
    { label: "Map", href: "/map" },
    { label: "Stats", href: "/stats" },
    { label: "Leaderboards", href: "/leaderboards" },
    { label: "About", href: "/about" },
  ] as { label: string; href: string }[],
};

export type SiteConfig = typeof siteConfig;
