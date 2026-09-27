"use client";

import { Button, type ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";

/** Minecraft-styled button (stone / grass / mango variants). */
export default function McButton({
  variant = "stone",
  className = "",
  ...props
}: Omit<ButtonProps, "variant" | "color"> & {
  variant?: "stone" | "grass" | "mango";
  children?: ReactNode;
}) {
  const mod =
    variant === "grass"
      ? "mc-button-grass"
      : variant === "mango"
        ? "mc-button-mango"
        : "";
  return (
    <Button
      {...props}
      className={`mc-button ${mod} ${className}`}
      variant="solid"
    />
  );
}
