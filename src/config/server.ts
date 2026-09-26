export const serverConfig = {
  name: "MangoZ SMP",
  version: "26.1.2",
  maxPlayers: 100,
  java: {
    address: process.env.NEXT_PUBLIC_JAVA_ADDRESS ?? "play.mangoz-smp.pages.dev",
  },
  bedrock: {
    address: process.env.NEXT_PUBLIC_BEDROCK_ADDRESS ?? "play.mangoz-smp.pages.dev",
    port: process.env.NEXT_PUBLIC_BEDROCK_PORT ?? "19132",
  },
  features: [
    {
      key: "economy",
      title: "Economy",
      description: "Balanced player-driven economy with shops, jobs and auctions.",
      icon: "Coins",
    },
    {
      key: "plugins",
      title: "Custom plugins",
      description: "Quality-of-life plugins tuned for survival, not pay-to-win.",
      icon: "Puzzle",
    },
    {
      key: "marketplace",
      title: "Player marketplace",
      description: "Buy and sell with other players in a safe trading hub.",
      icon: "Store",
    },
    {
      key: "claims",
      title: "Claims",
      description: "Protect your builds with simple land claiming.",
      icon: "Shield",
    },
    {
      key: "events",
      title: "Events",
      description: "Weekly build contests, drop parties and seasonal events.",
      icon: "CalendarDays",
    },
    {
      key: "crossplay",
      title: "Crossplay",
      description: "Java and Bedrock players on the same world.",
      icon: "Gamepad2",
    },
    {
      key: "map",
      title: "Server map",
      description: "Explore the world in your browser with a live map.",
      icon: "Map",
    },
    {
      key: "community",
      title: "Community",
      description: "Friendly staff, Discord chat and helpful starters.",
      icon: "Users",
    },
  ] as { key: string; title: string; description: string; icon: string }[],
};

export type ServerConfig = typeof serverConfig;
