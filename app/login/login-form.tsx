"use client";

import { useState } from "react";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { LogIn } from "lucide-react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [note, setNote] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setNote("Enter your Minecraft username to continue.");
      return;
    }
    setNote(
      `Thanks, ${username.trim()} — player accounts are not enabled yet. Your profile is already public at /players/${encodeURIComponent(username.trim())}.`
    );
  }

  return (
    <Card shadow="sm" className="border border-default-200">
      <CardBody className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Minecraft username"
            placeholder="e.g. OmHackz"
            value={username}
            onValueChange={setUsername}
            maxLength={16}
            autoComplete="username"
          />
          <Button type="submit" color="primary" className="w-full" startContent={<LogIn size={16} aria-hidden />}>
            Continue
          </Button>
        </form>
        {note ? (
          <p className="mt-4 rounded-xl bg-default-100 p-3 text-sm text-default-600" role="status">
            {note}
          </p>
        ) : (
          <p className="mt-4 text-xs text-default-500">
            No password needed yet. Authentication (Supabase Auth / next-auth) can be
            added without changing public pages.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
