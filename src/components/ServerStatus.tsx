"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Chip, Skeleton } from "@heroui/react";
import { Clock } from "lucide-react";
import type { ServerStatus } from "@/lib/types";
import { timeAgo } from "@/lib/format";

export default function ServerStatusCard({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/server/status", { cache: "no-store" });
        if (!res.ok) throw new Error("status failed");
        const json = await res.json();
        if (!cancelled) {
          if (json?.status) setStatus(json.status);
          else setUnavailable(true);
        }
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <Card className="border border-default-200" shadow="sm">
        <CardBody className="space-y-2 p-5">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-4 w-48 rounded-lg" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </CardBody>
      </Card>
    );
  }

  if (unavailable || !status) {
    return (
      <Card className="border border-default-200" shadow="sm" role="status">
        <CardBody className="p-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-default-400" aria-hidden />
            <p className="font-semibold">Status unavailable</p>
          </div>
          <p className="mt-1 text-sm text-default-500">
            Could not reach the server status API. Please try again later.
          </p>
        </CardBody>
      </Card>
    );
  }

  const online = status.online;
  return (
    <Card className="border border-default-200 bg-content1/80 backdrop-blur" shadow="sm" role="status" aria-live="polite">
      <CardBody className={compact ? "p-4" : "p-5"}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${online ? "bg-success animate-pulse" : "bg-danger"}`}
              aria-hidden
            />
            <p className="font-semibold">{online ? "Online" : "Offline"}</p>
          </div>
          <Chip size="sm" variant="flat" color={online ? "success" : "danger"}>
            {status.playersOnline} / {status.playersMax} Players
          </Chip>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-default-600">
          <Chip size="sm" variant="flat">Java + Bedrock</Chip>
          <Chip size="sm" variant="flat">Version {status.version}</Chip>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-default-500">
          <Clock size={13} aria-hidden />
          Updated {timeAgo(status.updatedAt)}
        </p>
      </CardBody>
    </Card>
  );
}
