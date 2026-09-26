"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider placement="bottom-center" toastOffset={16} />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  );
}
