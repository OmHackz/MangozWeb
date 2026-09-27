export const UPI_ID = "9732234305-2@ibl";
export const UPI_PAYEE = "MangoZ SMP";

export interface StoreItem {
  id: string;
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
    name: "&a&lVIP",
    tagline: "Stand out on the server",
    priceInr: 149,
    duration: "Lifetime",
    accent: "#55FF55",
    perks: [
      "&a[V IP] &7chat prefix",
      "&7/colornick — &acolored nickname",
      "&72 homes &7+ /hat & /craft",
      "&7Priority queue access",
    ],
  },
  {
    id: "mvp",
    name: "&b&lMVP",
    tagline: "Most popular pick",
    priceInr: 299,
    duration: "Lifetime",
    accent: "#55FFFF",
    perks: [
      "&b[MVP] &7chat prefix",
      "&7Everything in &aVIP",
      "&75 homes &7+ /enderchest",
      "&7Exclusive &bparticle trails",
    ],
  },
  {
    id: "legend",
    name: "&6&lLEGEND",
    tagline: "The ultimate mango",
    priceInr: 499,
    duration: "Lifetime",
    accent: "#FFAA00",
    perks: [
      "&6[LEGEND] &7animated prefix",
      "&7Everything in &bMVP",
      "&7Unlimited homes &7+ /fly in lobby",
      "&7Legend-only &6Discord role",
    ],
  },
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
