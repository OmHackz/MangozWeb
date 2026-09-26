import type { Metadata } from "next";
import { Card, CardBody, Chip } from "@heroui/react";
import { Activity, Database, ShieldAlert, Users } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/Headers";
import { dbConfigured, getPlayers, getServerStatus, getStats } from "@/lib/data";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = false; // TODO: wire Supabase Auth / middleware. Page stays hidden until then.
  const [players, status, stats] = await Promise.all([
    getPlayers().catch(() => null),
    getServerStatus().catch(() => null),
    getStats().catch(() => null),
  ]);
  const live = dbConfigured() && players !== null;

  if (!authed) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-default-100 text-default-500">
          <ShieldAlert size={22} aria-hidden />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Admin area</h1>
        <p className="mt-2 text-sm text-default-500">
          This section is reserved for server staff and requires authentication,
          which is not enabled yet. Public pages are unaffected.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Chip size="sm" variant="flat">Route: /admin (noindex)</Chip>
          <Chip size="sm" variant="flat" color={live ? "success" : "warning"}>
            DB: {live ? "connected" : "not connected"}
          </Chip>
        </div>
        <Card shadow="sm" className="mt-6 border border-default-200 text-left">
          <CardBody className="space-y-1 p-5 text-sm text-default-600">
            <p><strong className="text-foreground">Planned:</strong> server status, player management, announcements, DB &amp; API health, online list.</p>
            <p>Wire <code className="rounded bg-default-100 px-1 text-xs">SUPABASE_URL</code> + auth, then gate this route in <code className="rounded bg-default-100 px-1 text-xs">middleware.ts</code>.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-10">
      <PageHeader title="Admin" description="Staff-only overview." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card shadow="sm" className="border border-default-200"><CardBody className="p-5"><p className="flex items-center gap-2 text-sm font-semibold"><Users size={16} aria-hidden /> Online</p><p className="text-2xl font-bold">{(players ?? []).filter((p) => p.online).length}</p></CardBody></Card>
        <Card shadow="sm" className="border border-default-200"><CardBody className="p-5"><p className="flex items-center gap-2 text-sm font-semibold"><Activity size={16} aria-hidden /> API</p><p className="text-2xl font-bold">OK</p></CardBody></Card>
        <Card shadow="sm" className="border border-default-200"><CardBody className="p-5"><p className="flex items-center gap-2 text-sm font-semibold"><Database size={16} aria-hidden /> DB</p><p className="text-2xl font-bold">{live ? "Live" : "Down"}</p></CardBody></Card>
      </div>
      <div className="mt-6">
        <SectionHeader title="Online players" />
        <ul className="text-sm">
          {(players ?? []).filter((p) => p.online).map((p) => <li key={p.uuid}>{p.username}</li>)}
        </ul>
        {status ? (
          <p className="mt-2 text-xs text-default-500">
            Last status report: {status.updatedAt} · {status.playersOnline}/{status.playersMax} online
          </p>
        ) : (
          <p className="mt-2 text-xs text-default-500">No status report received yet.</p>
        )}
      </div>
    </div>
  );
}
