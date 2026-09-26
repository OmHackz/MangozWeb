import { Card, CardBody, Skeleton } from "@heroui/react";

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card className="border border-default-200" shadow="sm">
      <CardBody className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/5 rounded-lg" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full rounded-lg" />
        ))}
      </CardBody>
    </Card>
  );
}

export function PlayerGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} lines={2} />
      ))}
    </div>
  );
}

export function StatGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} lines={1} />
      ))}
    </div>
  );
}
