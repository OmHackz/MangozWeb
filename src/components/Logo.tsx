"use client";

import { useState } from "react";
import { Citrus } from "./BrandIcons";

/**
 * Site logo. Uses the owner's artwork when present:
 *   public/logo-text.png  — "Mangoz SMP" banner (navbar, footer, hero)
 *   public/logo-mango.png — mango-on-grass-block mark
 * Falls back to a styled text + icon mark so the site never looks broken.
 */
export function LogoText({ height = 36 }: { height?: number }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <span className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[2px] border-2 border-black bg-primary text-white">
          <Citrus size={18} aria-hidden />
        </span>
        <span className="mc-title text-lg">MangoZ SMP</span>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-text.png"
      alt="MangoZ SMP"
      height={height}
      style={{ height }}
      className="image-pixelated w-auto"
      onError={() => setMissing(true)}
    />
  );
}

export function LogoMark({ size = 40 }: { size?: number }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <span
        className="flex items-center justify-center rounded-[2px] border-2 border-black bg-primary text-white"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Citrus size={size * 0.5} />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mango.png"
      alt=""
      width={size}
      height={size}
      className="image-pixelated"
      onError={() => setMissing(true)}
    />
  );
}
