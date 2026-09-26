import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "MangoZ SMP — Minecraft Survival Server",
    template: "%s | MangoZ SMP",
  },
  description: siteConfig.description,
  keywords: ["Minecraft", "SMP", "survival", "crossplay", "MangoZ SMP", "economy", "server"],
  authors: [{ name: "MangoZ SMP" }],
  openGraph: {
    type: "website",
    siteName: "MangoZ SMP",
    title: "MangoZ SMP — Minecraft Survival Server",
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "MangoZ SMP — Minecraft Survival Server",
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 sm:px-6">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
