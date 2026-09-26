import { Card, CardBody } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  animated = false,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  animated?: boolean;
}) {
  return (
    <Card className="border border-default-200 bg-content1" shadow="sm">
      <CardBody className="flex flex-row items-center gap-4 p-5">
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-600 dark:text-primary-400">
            <Icon size={20} aria-hidden />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-default-500">
            {title}
          </p>
          <p className="truncate text-2xl font-bold tracking-tight">
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
