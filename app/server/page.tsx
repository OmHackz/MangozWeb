import type { Metadata } from "next";
import { Card, CardBody, Chip } from "@heroui/react";
import { CalendarDays, Coins, Gamepad2, Map as MapIcon, Puzzle, Shield, Store, Users, Wifi } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/Headers";
import ServerStatusCard from "@/components/ServerStatus";
import ServerAddress from "@/components/ServerAddress";
import StatusPills from "@/components/StatusPills";
import { serverConfig } from "@/config/server";
import { getServerStatus } from "@/lib/data";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Server" };
export const revalidate = 30;

const icons: Record<string, typeof Coins> = {
  Coins, Puzzle, Store, Shield, CalendarDays, Gamepad2, Map: MapIcon, Users,
};

export default async function ServerPage() {
  const status = await getServerStatus().catch(() => null);

  return (
    <div className="py-10">
      <PageHeader title="Server" description="Connection details, status and features for MangoZ SMP." />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div>
          <SectionHeader title="Connection" description="Java and Bedrock players share the same world." />
          <ServerAddress />
          <div className="mt-6">
            <SectionHeader title="Server information" />
            <Card shadow="sm" className="border border-default-200">
              <CardBody className="grid gap-4 p-6 sm:grid-cols-2">
                <Info label="Server name" value={serverConfig.name} />
                <Info label="Version" value={status?.version ?? "Unknown"} />
                <Info label="Platform" value="Java + Bedrock crossplay" />
                <Info label="Java" value={status ? (status.javaOnline ? "Available" : "Unavailable") : "Unknown"} />
                <Info label="Bedrock" value={status ? (status.bedrockOnline ? "Available" : "Unavailable") : "Unknown"} />
                <Info label="Online" value={status ? `${status.playersOnline} / ${status.playersMax}` : "Unknown"} />
                <Info label="Last updated" value={status ? timeAgo(status.updatedAt) : "Never reported"} />
              </CardBody>
            </Card>
          </div>
        </div>
        <div>
          <SectionHeader title="Live status" />
          <ServerStatusCard />
          <div className="mt-4">
            <StatusPills service="server" title="SERVER UPTIME — LAST 3H" />
          </div>
          <Card shadow="sm" className="mt-4 border border-default-200">
            <CardBody className="flex items-center gap-3 p-5">
              <Wifi size={18} className="text-success" aria-hidden />
              <div className="text-sm">
                <p className="font-semibold">Crossplay enabled</p>
                <p className="text-default-500">Join from PC, console or mobile.</p>
              </div>
              <Chip size="sm" variant="flat" color="success" className="ml-auto">Java + Bedrock</Chip>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeader title="Server features" description="What makes MangoZ SMP worth your time." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serverConfig.features.map((f) => {
            const Icon = icons[f.icon] ?? Coins;
            return (
              <Card key={f.key} shadow="sm" className="border border-default-200">
                <CardBody className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary-600 dark:text-primary-400">
                    <Icon size={19} aria-hidden />
                  </div>
                  <p className="mt-3 font-semibold">{f.title}</p>
                  <p className="mt-1 text-sm text-default-500">{f.description}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-default-500">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}
