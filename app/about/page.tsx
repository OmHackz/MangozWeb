import type { Metadata } from "next";
import { Card, CardBody } from "@heroui/react";
import { Citrus, Gamepad2, Globe, HeartHandshake } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/Headers";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="py-10">
      <PageHeader title="About MangoZ SMP" description={siteConfig.tagline} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card shadow="sm" className="border border-default-200">
          <CardBody className="p-6">
            <Citrus size={20} className="text-primary" aria-hidden />
            <p className="mt-2 font-semibold">Community first</p>
            <p className="mt-1 text-sm text-default-500">
              MangoZ SMP is a community-driven survival server. Fair rules, friendly
              staff and a world shaped by its players.
            </p>
          </CardBody>
        </Card>
        <Card shadow="sm" className="border border-default-200">
          <CardBody className="p-6">
            <Gamepad2 size={20} className="text-primary" aria-hidden />
            <p className="mt-2 font-semibold">Survival, improved</p>
            <p className="mt-1 text-sm text-default-500">
              Custom gameplay, a balanced economy, claims, a player marketplace and
              regular events — without pay-to-win.
            </p>
          </CardBody>
        </Card>
        <Card shadow="sm" className="border border-default-200">
          <CardBody className="p-6">
            <Globe size={20} className="text-primary" aria-hidden />
            <p className="mt-2 font-semibold">Play anywhere</p>
            <p className="mt-1 text-sm text-default-500">
              Java and Bedrock players share one world. Join from PC, console or
              mobile and pick up where you left off.
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <SectionHeader title="Rules & values" />
        <Card shadow="sm" className="border border-default-200">
          <CardBody className="space-y-2 p-6 text-sm text-default-600">
            <p className="flex gap-2"><HeartHandshake size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden /> Be kind — no griefing, stealing or harassment.</p>
            <p className="flex gap-2"><HeartHandshake size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden /> Play fair — no cheating, exploits or lag machines.</p>
            <p className="flex gap-2"><HeartHandshake size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden /> Build together — respect claims and community areas.</p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <SectionHeader title="Community" description="Official links only — anything else is unofficial." />
        <CommunityLinks />
      </div>
    </div>
  );
}

function CommunityLinks() {
  const links = [
    { label: "Official website", href: siteConfig.links.website },
    siteConfig.links.discord ? { label: "Discord", href: siteConfig.links.discord } : null,
    siteConfig.links.youtube ? { label: "YouTube", href: siteConfig.links.youtube } : null,
    siteConfig.links.map ? { label: "Live map", href: siteConfig.links.map } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target={l.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="rounded-xl border border-default-200 bg-content1 px-4 py-2 text-sm font-medium hover:border-primary-300 hover:text-primary"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
