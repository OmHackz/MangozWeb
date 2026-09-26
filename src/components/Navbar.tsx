"use client";

import {
  Button,
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { Citrus, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <HeroNavbar
      isMenuOpen={open}
      onMenuOpenChange={setOpen}
      isBordered
      className="bg-background/70 backdrop-blur-xl"
      maxWidth="xl"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={open ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand as={Link} href="/" className="gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Citrus size={18} aria-hidden />
          </span>
          <span className="font-bold tracking-tight">MangoZ SMP</span>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-1 sm:flex" justify="center">
        {siteConfig.nav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <NavbarItem key={item.href} isActive={active}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 font-semibold text-primary-700 dark:text-primary-400"
                    : "text-default-600 hover:bg-default-100 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitcher />
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            href="/login"
            color="primary"
            variant="flat"
            size="sm"
            startContent={<User size={15} aria-hidden />}
          >
            Login
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {siteConfig.nav.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block w-full rounded-lg px-2 py-2 ${
                pathname === item.href ? "font-semibold text-primary" : ""
              }`}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <div className="flex items-center gap-2 px-2 py-2">
            <ThemeSwitcher />
            <span className="text-sm text-default-500">Toggle theme</span>
          </div>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroNavbar>
  );
}
