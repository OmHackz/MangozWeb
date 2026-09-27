"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Skeleton,
} from "@heroui/react";
import { ChevronDown, Inbox, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { useAuth } from "./AuthProvider";
import { avatarUrl } from "@/lib/minecraft";
import { LogoText } from "./Logo";
import ThemeSwitcher from "./ThemeSwitcher";
import McButton from "./McButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { username, ready, logout } = useAuth();

  function accountAction(key: React.Key) {
    if (!username) return;
    if (key === "profile") router.push(`/players/${encodeURIComponent(username)}`);
    else if (key === "inbox") router.push("/inbox");
    else if (key === "logout") logout();
  }

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
          className="md:hidden"
        />
        <NavbarBrand as={Link} href="/" className="gap-2" aria-label="MangoZ SMP home">
          <LogoText />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-0.5 md:flex" justify="center">
        {siteConfig.nav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <NavbarItem key={item.href} isActive={active}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2.5 py-2 font-pixel text-[10px] transition-colors lg:text-[11px] ${
                  active
                    ? "bg-primary/10 text-primary-700 dark:text-primary-400"
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
          {!ready ? (
            <Skeleton className="h-8 w-20 rounded-md" />
          ) : username ? (
            <Dropdown placement="bottom-end" aria-label="Account menu">
              <DropdownTrigger>
                <Button
                  variant="flat"
                  size="sm"
                  className="border-2 border-black font-pixel text-[10px]"
                  startContent={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl(username, 32)}
                      alt=""
                      width={20}
                      height={20}
                      className="image-pixelated rounded-[2px]"
                    />
                  }
                  endContent={<ChevronDown size={14} aria-hidden />}
                >
                  {username}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Account actions" onAction={accountAction}>
                <DropdownItem
                  key="profile"
                  startContent={<User size={15} aria-hidden />}
                >
                  My profile
                </DropdownItem>
                <DropdownItem
                  key="inbox"
                  startContent={<Inbox size={15} aria-hidden />}
                >
                  Inbox
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<LogOut size={15} aria-hidden />}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <McButton
              as={Link}
              href="/login"
              size="sm"
              startContent={<User size={14} aria-hidden />}
            >
              Login
            </McButton>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {siteConfig.nav.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block w-full rounded-lg px-2 py-2 font-pixel text-xs ${
                pathname === item.href ? "text-primary" : ""
              }`}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        {username ? (
          <>
            <NavbarMenuItem>
              <Link
                href="/inbox"
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg px-2 py-2 font-pixel text-xs"
              >
                Inbox
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="block w-full rounded-lg px-2 py-2 text-left font-pixel text-xs text-danger"
              >
                Logout ({username})
              </button>
            </NavbarMenuItem>
          </>
        ) : null}
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
