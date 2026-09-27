"use client";

import { useState } from "react";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { avatarUrl } from "@/lib/minecraft";
import McButton from "@/components/McButton";

export default function LoginForm() {
  const { username, ready, login, logout } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(name);
    if (!res.ok) {
      setError(res.error ?? "Invalid username.");
      return;
    }
    setError("");
    router.push("/inbox");
  }

  if (!ready) return null;

  if (username) {
    return (
      <Card shadow="sm" className="border-2 border-black">
        <CardBody className="flex flex-col items-center gap-3 p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl(username, 64)}
            alt={`${username} avatar`}
            width={64}
            height={64}
            className="image-pixelated rounded-[2px] border-2 border-black"
          />
          <p className="font-pixel text-sm">Logged in as {username}</p>
          <p className="text-xs text-default-500">
            View your <Link href="/inbox" className="text-primary underline">inbox</Link> or{" "}
            <Link href={`/players/${encodeURIComponent(username)}`} className="text-primary underline">
              profile
            </Link>
            .
          </p>
          <Button
            variant="flat"
            color="danger"
            size="sm"
            onPress={logout}
            startContent={<LogOut size={15} aria-hidden />}
          >
            Logout
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card shadow="sm" className="border-2 border-black">
      <CardBody className="p-6">
        <p className="mc-title text-center text-lg">PLAYER LOGIN</p>
        <p className="mt-1 text-center text-xs text-default-500">
          Just your Minecraft username. No password, no account.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <Input
            label="Minecraft username"
            labelPlacement="outside"
            placeholder="e.g. OmHackz"
            value={name}
            onValueChange={(v) => {
              setName(v);
              setError("");
            }}
            maxLength={16}
            autoComplete="username"
            isInvalid={Boolean(error)}
            errorMessage={error}
          />
          <McButton type="submit" variant="grass" className="w-full" startContent={<LogIn size={15} aria-hidden />}>
            Login
          </McButton>
        </form>
        <p className="mt-4 text-center text-xs text-default-500">
          Saved only in this browser. Use it for the store and inbox.
        </p>
      </CardBody>
    </Card>
  );
}
