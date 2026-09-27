"use client";

import { parseMcCodes, stripMcCodes } from "@/lib/mc-format";

/** Render a Minecraft color-coded string (&a, &l, ...) as styled text. */
export default function McText({
  code,
  className = "",
  as: Tag = "span",
}: {
  code: string;
  className?: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3";
}) {
  const segments = parseMcCodes(code);
  return (
    <Tag className={className} aria-label={stripMcCodes(code)}>
      {segments.map((s, i) => (
        <span
          key={i}
          style={{
            color: s.color,
            fontWeight: s.bold ? "bold" : undefined,
            fontStyle: s.italic ? "italic" : undefined,
            textDecoration: [
              s.underline ? "underline" : "",
              s.strike ? "line-through" : "",
            ]
              .filter(Boolean)
              .join(" ") || undefined,
          }}
        >
          {s.text}
        </span>
      ))}
    </Tag>
  );
}
