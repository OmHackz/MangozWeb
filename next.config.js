/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "mc-heads.net" },
      { protocol: "https", hostname: "crafatar.com" },
      { protocol: "https", hostname: "minotar.net" },
      { protocol: "https", hostname: "visage.surgeplay.com" },
    ],
  },
};

module.exports = nextConfig;
