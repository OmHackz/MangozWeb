export interface OrderReceipt {
  id?: string;
  username: string;
  itemId: string;
  itemName: string;
  amountInr: number;
  utr: string;
  status: "pending";
  createdAt: string;
  persisted: boolean;
}

const KEY = "mangoz-orders";

export function getReceipts(): OrderReceipt[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as OrderReceipt[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveReceipt(r: OrderReceipt) {
  try {
    const all = getReceipts();
    all.unshift(r);
    window.localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
  } catch {
    // ignore
  }
}
