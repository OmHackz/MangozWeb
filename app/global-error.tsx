import Link from "next/link";
import { Button } from "@heroui/react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
          <p className="max-w-sm text-sm text-gray-500">
            Unable to load this page. Please try again.
          </p>
          <div className="flex gap-2">
            <Button color="primary" onPress={reset}>Try again</Button>
            <Button as={Link} href="/" variant="flat">Home</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
