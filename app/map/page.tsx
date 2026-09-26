import type { Metadata } from "next";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { ExternalLink, Map as MapIcon } from "lucide-react";
import { PageHeader } from "@/components/Headers";
import { siteConfig } from "@/config/site";
import { getServerStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Map" };
export const revalidate = 60;

export default async function MapPage() {
  const mapUrl = siteConfig.links.map;
  const { status } = await getServerStatus();

  return (
    <div className="py-10">
      <PageHeader
        title="Server map"
        description="Explore the MangoZ SMP world. The live map embeds here once configured."
      />

      <Card shadow="sm" className="overflow-hidden border border-default-200">
        {mapUrl ? (
          <iframe
            title="MangoZ SMP live map"
            src={mapUrl}
            className="h-[70vh] w-full border-0"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <CardBody className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-600 dark:text-primary-400">
              <MapIcon size={26} aria-hidden />
            </div>
            <h2 className="text-xl font-semibold">Live map coming soon</h2>
            <p className="max-w-md text-sm text-default-500">
              The interactive world map is not configured yet. Server owners can set
              <code className="mx-1 rounded bg-default-100 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_MAP_URL</code>
              to a BlueMap or Dynmap URL and it will appear here automatically — no code changes needed.
            </p>
            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                variant="flat"
                color={status?.online ? "success" : "default"}
              >
                {status?.online ? `Server online · ${status.playersOnline} players` : "Server status"}
              </Chip>
              <Button as="a" href="/server" variant="flat" color="primary" size="sm">
                Server info
              </Button>
            </div>
          </CardBody>
        )}
      </Card>

      <Card shadow="sm" className="mt-4 border border-default-200">
        <CardBody className="flex flex-col gap-2 p-5 text-sm text-default-600 sm:flex-row sm:items-center">
          <p>
            <strong className="text-foreground">For server owners:</strong> deploy BlueMap or
            Dynmap, expose its web UI over HTTPS, then set <code className="rounded bg-default-100 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_MAP_URL</code> in
            the hosting dashboard and redeploy.
          </p>
          {mapUrl ? (
            <Button
              as="a"
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              size="sm"
              variant="flat"
              color="primary"
              className="shrink-0"
              endContent={<ExternalLink size={14} aria-hidden />}
            >
              Open full map
            </Button>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
