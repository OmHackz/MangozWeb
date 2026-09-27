"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Rotating 3D cube rendered as ASCII art (crafting-table vibes).
 * Pure math + <pre>, no assets, pauses when prefers-reduced-motion.
 */

const EDGES: [number, number][] = [
  [0, 1], [1, 3], [3, 2], [2, 0],
  [4, 5], [5, 7], [7, 6], [6, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];
const VERTS: [number, number, number][] = [
  [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
];

const W = 34;
const H = 16;
const SHADES = " .:+*#@";

function renderFrame(angle: number): string {
  const tilt = 0.45;
  const cosY = Math.cos(angle);
  const sinY = Math.sin(angle);
  const cosX = Math.cos(tilt);
  const sinX = Math.sin(tilt);

  const pts = VERTS.map(([x, y, z]) => {
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    const s = 5.2 / (6.4 + z2);
    return { sx: W / 2 + x1 * s * 2.1, sy: H / 2 + y1 * s * 1.35, d: z2 };
  });

  const grid: { ch: string; d: number }[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => ({ ch: " ", d: Infinity }))
  );

  function plot(x: number, y: number, d: number, ch: string) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) return;
    if (d < grid[iy][ix].d) grid[iy][ix] = { ch, d };
  }

  for (const [a, b] of EDGES) {
    const p = pts[a];
    const q = pts[b];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = p.sx + (q.sx - p.sx) * t;
      const y = p.sy + (q.sy - p.sy) * t;
      const d = p.d + (q.d - p.d) * t;
      const shade = SHADES[Math.max(0, Math.min(SHADES.length - 1, Math.round(2 + d * 1.6)))];
      plot(x, y, d, shade);
    }
  }
  for (const p of pts) plot(p.sx, p.sy, p.d - 0.01, "@");

  return grid.map((row) => row.map((c) => c.ch).join("")).join("\n");
}

export default function AsciiCraft({ title = "ASCII // LIVE RENDER" }: { title?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = renderFrame(0.7);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const angle = ((now - start) / 1000) * 0.7;
      el.textContent = renderFrame(angle);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <div className="mc-panel overflow-hidden" role="img" aria-label="Rotating wireframe cube rendered in ASCII">
      <div className="border-b-2 border-black/60 px-3 py-1.5 font-pixel text-[10px] tracking-wider text-amber-300">
        {title}
      </div>
      <pre
        ref={ref}
        className="select-none overflow-hidden px-3 py-2 font-mono text-[11px] leading-[1.15] text-amber-300 sm:text-xs"
      />
    </div>
  );
}
