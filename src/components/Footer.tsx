import Link from "next/link";
import { Citrus, DiscordIcon, YoutubeIcon } from "./BrandIcons";
import { siteConfig } from "@/config/site";
import { Globe } from "lucide-react";

export default function Footer() {
  const community = [
    { label: "Website", href: siteConfig.links.website, show: true },
    { label: "Discord", href: siteConfig.links.discord, show: Boolean(siteConfig.links.discord) },
    { label: "YouTube", href: siteConfig.links.youtube, show: Boolean(siteConfig.links.youtube) },
    { label: "Live map", href: siteConfig.links.map || "/map", show: true },
  ].filter((l) => l.show && l.href);

  return (
    <footer className="mt-16 border-t border-default-200 bg-content1/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Citrus size={18} aria-hidden />
            </span>
            <span className="font-bold">MangoZ SMP</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-default-500">
            {siteConfig.tagline} A community-driven Minecraft survival server
            with economy, events and crossplay.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="text-sm font-semibold">Explore</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {siteConfig.nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-default-500 hover:text-primary">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold">Community</p>
          <ul className="mt-3 space-y-2 text-sm">
            {community.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-default-500 hover:text-primary"
                >
                  <Globe size={14} aria-hidden /> {c.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            {siteConfig.links.discord ? (
              <a href={siteConfig.links.discord} target="_blank" rel="noreferrer" aria-label="Discord" className="rounded-lg bg-default-100 p-2 hover:bg-primary/15">
                <DiscordIcon />
              </a>
            ) : null}
            {siteConfig.links.youtube ? (
              <a href={siteConfig.links.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="rounded-lg bg-default-100 p-2 hover:bg-primary/15">
                <YoutubeIcon />
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="border-t border-default-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-default-500 sm:flex-row">
          <p>MangoZ SMP — Made for the community.</p>
          <p>Not affiliated with Mojang or Microsoft.</p>
        </div>
      </div>
    </footer>
  );
}
