export interface NewsItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

/** Built-in announcements, shown when the database has none. */
export const defaultNews: NewsItem[] = [
  {
    id: "welcome",
    title: "Welcome to MangoZ SMP",
    body: "Survival, economy, events and crossplay — Java and Bedrock players share one world. Read the rules with /rules in game.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "store",
    title: "Ranks are now in the Store",
    body: "Support the server and grab VIP, MVP or LEGEND perks. Pay with UPI, submit your transaction ID, and staff verify it manually.",
    createdAt: new Date().toISOString(),
  },
];
