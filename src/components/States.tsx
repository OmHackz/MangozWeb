import { Button, Card, CardBody } from "@heroui/react";
import { AlertTriangle, SearchX, type LucideIcon } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Card className="border border-dashed border-default-300" shadow="none">
      <CardBody className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-100 text-default-500">
          <Icon size={22} aria-hidden />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="max-w-sm text-sm text-default-500">{description}</p>
        ) : null}
        {actionLabel && actionHref ? (
          <Button as={Link} href={actionHref} color="primary" variant="flat" size="sm">
            {actionLabel}
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border border-danger-200 bg-danger-50 dark:bg-danger-900/10" shadow="none">
      <CardBody className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger-600 dark:bg-danger-900/40">
          <AlertTriangle size={22} aria-hidden />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="max-w-sm text-sm text-default-600">{description}</p>
        ) : null}
        {onRetry ? (
          <Button color="danger" variant="flat" size="sm" onPress={onRetry}>
            Try again
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}
