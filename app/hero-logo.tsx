"use client";

import { useState } from "react";

/** Owner artwork (public/logo-text.png) with a text fallback. */
export default function HeroLogo() {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <h1 className="mc-title mt-4 text-4xl sm:text-5xl">
        MangoZ <span className="text-primary">SMP</span>
      </h1>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-text.png"
      alt="MangoZ SMP"
      className="image-pixelated mt-4 max-w-full sm:max-w-md"
      onError={() => setMissing(true)}
    />
  );
}
