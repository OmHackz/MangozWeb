"use client";

import { Button } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <Button isIconOnly variant="light" size="sm" aria-label="Toggle theme" isDisabled>
        <Sun size={17} />
      </Button>
    );
  }
  const dark = theme === "dark";
  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onPress={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  );
}
