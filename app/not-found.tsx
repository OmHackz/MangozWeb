import Link from "next/link";
import { Button } from "@heroui/react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-3 text-2xl font-bold">Page not found.</h1>
      <p className="mt-2 max-w-sm text-sm text-default-500">
        The page you are looking for does not exist.
      </p>
      <Button as={Link} href="/" color="primary" className="mt-6">
        Go home
      </Button>
    </div>
  );
}
