import { Card, CardBody } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

const TILE_COLORS = [
  "bg-amber-500",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-orange-600",
  "bg-teal-600",
  "bg-indigo-600",
];

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  animated = false,
  colorIndex = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  animated?: boolean;
  colorIndex?: number;
}) {
  return (
    <Card
      className="border-2 border-black bg-content1"
      shadow="sm"
      style={{ boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.06)" }}
    >
      <CardBody className="flex flex-row items-center gap-4 p-5">
        {Icon ? (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] border-2 border-black text-white ${TILE_COLORS[colorIndex % TILE_COLORS.length]}`}
          >
            <Icon size={22} aria-hidden />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="font-pixel text-[9px] uppercase tracking-wider text-default-500">
            {title}
          </p>
          <p className="truncate font-pixel text-lg tracking-tight sm:text-xl">
            {animated && typeof value === "number" ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </p>
          {subtitle ? (
            <p className="truncate text-xs text-default-500">{subtitle}</p>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
