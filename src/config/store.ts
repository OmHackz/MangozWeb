export const UPI_ID = "9732234305-2@ibl";
export const UPI_PAYEE = "MangoZ SMP";

export interface StoreItem {
  id: string;
  kind: "rank" | "donation";
  /** Minecraft color-coded display name, e.g. "&a&lVIP" */
  name: string;
  tagline: string;
  priceInr: number;
  duration: string;
  accent: string;
  /** Perks may use & color codes */
  perks: string[];
}

export const storeItems: StoreItem[] = [
  {
    id: "vip",
    kind: "rank",
    name: "&a&lVIP",
    tagline: "Stand out on the server",
    priceInr: 10,
    duration: "Lifetime",
    accent: "#55FF55",
    perks: [
      "&a[VIP] &7chat prefix",
      "&7Colored nickname",
      "&72 homes",
    ],
  },
  {
    id: "vipplus",
    kind: "rank",
    name: "&a&lVIP&e&l+",
    tagline: "VIP, plus a little extra",
    priceInr: 15,
    duration: "Lifetime",
    accent: "#FFFF55",
    perks: [
      "&7Everything in &aVIP",
      "&a[VIP&e+&a] &7chat prefix",
      "&73 homes &7+ /hat",
      "&7Priority queue access",
    ],
  },
  {
    id: "mvp",
    kind: "rank",
    name: "&b&lMVP",
    tagline: "Most popular pick",
    priceInr: 20,
    duration: "Lifetime",
    accent: "#55FFFF",
    perks: [
      "&7Everything in &aVIP&e+",
      "&b[MVP] &7chat prefix",
      "&75 homes &7+ /craft",
      "&7Exclusive &bparticle trails",
    ],
  },
  {
    id: "mvpplus",
    kind: "rank",
    name: "&b&lMVP&6&l+",
    tagline: "The ultimate mango",
    priceInr: 30,
    duration: "Lifetime",
    accent: "#FFAA00",
    perks: [
      "&7Everything in &bMVP",
      "&b[MVP&6+&b] &7animated prefix",
      "&78 homes &7+ /enderchest",
      "&7Legend-only &6Discord role",
    ],
  },
  {
    id: "donate-hosting",
    kind: "donation",
    name: "&6&lSERVER &e&lHOSTING",
    tagline: "Keep the server online",
    priceInr: 100,
    duration: "One-time",
    accent: "#FFAA00",
    perks: [
      "&7Funds the Minecraft server hosting",
      "&6[Donor] &7Discord role",
      "&7Thank-you broadcast in game",
    ],
  },
  {
    id: "donate-database",
    kind: "donation",
    name: "&b&lDATABASE &3&lFUND",
    tagline: "Keep player data safe",
    priceInr: 50,
    duration: "One-time",
    accent: "#55FFFF",
    perks: [
      "&7Funds the database that powers stats & ranks",
      "&6[Donor] &7Discord role",
      "&7Thank-you broadcast in game",
    ],
  },
  {
    id: "donate-site",
    kind: "donation",
    name: "&d&lSITE &5&lHOSTING",
    tagline: "Keep this website running",
    priceInr: 50,
    duration: "One-time",
    accent: "#FF55FF",
    perks: [
      "&7Funds website hosting & domain",
      "&6[Donor] &7Discord role",
      "&7Thank-you broadcast in game",
    ],
  },
];

export interface DonationGoal {
  id: string;
  label: string;
  goalInr: number;
  /** Update this manually as donations are verified. */
  raisedInr: number;
  itemId: string;
}

export const donationGoals: DonationGoal[] = [
  { id: "hosting", label: "Server Hosting", goalInr: 100, raisedInr: 0, itemId: "donate-hosting" },
  { id: "database", label: "Database", goalInr: 50, raisedInr: 0, itemId: "donate-database" },
  { id: "site", label: "Site Hosting", goalInr: 50, raisedInr: 0, itemId: "donate-site" },
];

export function upiUri(itemId: string, username: string, amount: number): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `MangoZ-${itemId}-${username}`.slice(0, 80),
  });
  return `upi://pay?${params.toString()}`;
}

export function upiQrUrl(itemId: string, username: string, amount: number): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
    upiUri(itemId, username, amount)
  )}`;
}
