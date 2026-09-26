"use client";

import { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Check, Copy } from "lucide-react";
import { serverConfig } from "@/config/server";

export default function HeroCopyIp() {
  const [copied, setCopied] = useState(false);
  const ip = serverConfig.java.address;

  async function copy() {
    try {
      await navigator.clipboard.writeText(ip);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = ip;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex max-w-md flex-wrap items-center gap-2 rounded-2xl border border-default-200 bg-background/80 p-2 pl-4 backdrop-blur">
      <code className="min-w-0 flex-1 truncate text-sm font-medium" aria-label={`Server IP ${ip}`}>
        {ip}
      </code>
      <Tooltip content={copied ? "Copied!" : "Copy server IP"}>
        <Button
          color={copied ? "success" : "primary"}
          size="sm"
          onPress={copy}
          aria-label="Copy server IP"
          startContent={copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
        >
          {copied ? "Copied" : "Copy IP"}
        </Button>
      </Tooltip>
    </div>
  );
}
