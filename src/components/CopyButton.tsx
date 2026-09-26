"use client";

import { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({
  value,
  label = "Copy",
  size = "sm",
}: {
  value: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Tooltip content={copied ? "Copied!" : label} closeDelay={500}>
      <Button
        isIconOnly={false}
        size={size}
        variant="flat"
        color={copied ? "success" : "primary"}
        onPress={handleCopy}
        aria-label={`${label}: ${value}`}
        startContent={copied ? <Check size={15} /> : <Copy size={15} />}
      >
        {copied ? "Copied" : label}
      </Button>
    </Tooltip>
  );
}
