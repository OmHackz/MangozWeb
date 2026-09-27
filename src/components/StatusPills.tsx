"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Chip, Skeleton } from "@heroui/react";
import type { Pill } from "@/app/api/status/history/route";

const PILL_COLOR: Record<Pill["state"], string> = {
  up: "bg-emerald-500",
  down: "bg-red-500",
  partial: "bg-amber-400",
  nodata: "bg-default-300 dark:bg-default-100/20",
};

const PILL_LABEL: Record<Pill["state"], string> = {
  up: "Online",
  down: "Offline",
  partial: "Partial outage",
  nodata: "No data yet",
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Uptime-style pill graph for the last N hours (default 3). */
export default function StatusPills({
  service,
  title,
  hours = 3,
}: {
  service: "server" | "bot";
  title: string;
  hours?: number;
}) {
  const [pills, setPills] = useState<Pill[] | null>(null);
  const [uptime, setUptime] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/status/history?service=${service}&hours=${hours}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (cancelled) return;
        if (json?.success) {
          setPills(json.pills);
          setUptime(json.uptimePercent);
        } else {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [service, hours]);

  return (
    <Card shadow="sm" className="border-2 border-black">
      <CardBody className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-pixel text-xs">{title}</p>
          {uptime !== null ? (
            <Chip
              size="sm"
              variant="flat"
              color={uptime >= 99 ? "success" : uptime >= 90 ? "warning" : "danger"}
            >
              {uptime.toFixed(1)}% uptime
            </Chip>
          ) : null}
        </div>

        {failed ? (
          <p className="text-sm text-default-500">
            Could not load history. New data appears once the {service === "bot" ? "bot" : "server"} reports in.
          </p>
        ) : pills === null ? (
          <div className="flex h-9 gap-1" aria-label="Loading history">
            {Array.from({ length: 24 }).map((_, i) => (
              <Skeleton key={i} className="h-full flex-1 rounded-[2px]" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex h-9 gap-1" role="img" aria-label={`${title}: ${uptime !== null ? `${uptime.toFixed(1)} percent uptime` : "no data yet"}`}>
              {pills.map((p) => {
                const label = `${fmtTime(p.t)} — ${PILL_LABEL[p.state]}${
                  p.players !== null ? ` — ${p.players} players` : ""
                }`;
                return (
                  <div
                    key={p.t}
                    title={label}
                    aria-label={label}
                    className={`min-w-0 flex-1 rounded-[2px] ${PILL_COLOR[p.state]}`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-default-500">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-[1px] bg-emerald-500" aria-hidden /> Online
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-[1px] bg-amber-400" aria-hidden /> Partial
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-[1px] bg-red-500" aria-hidden /> Offline
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-[1px] bg-default-300" aria-hidden /> No data
              </span>
              <span className="ml-auto">Last {hours}h · 5-min pills</span>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
