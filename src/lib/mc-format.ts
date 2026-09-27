/**
 * Minecraft formatting codes (&0–&f colors, &l &o &n &m styles, &r reset).
 * Renders legacy color-coded strings like "&6&lMANGO &eVIP" as styled spans.
 */

export interface McSegment {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

export const MC_COLORS: Record<string, string> = {
  "0": "#000000",
  "1": "#0000AA",
  "2": "#00AA00",
  "3": "#00AAAA",
  "4": "#AA0000",
  "5": "#AA00AA",
  "6": "#FFAA00",
  "7": "#AAAAAA",
  "8": "#555555",
  "9": "#5555FF",
  a: "#55FF55",
  b: "#55FFFF",
  c: "#FF5555",
  d: "#FF55FF",
  e: "#FFFF55",
  f: "#FFFFFF",
};

export function parseMcCodes(input: string): McSegment[] {
  const segments: McSegment[] = [];
  let color: string | undefined;
  let bold = false;
  let italic = false;
  let underline = false;
  let strike = false;
  let buf = "";

  function flush() {
    if (buf) {
      segments.push({ text: buf, color, bold, italic, underline, strike });
      buf = "";
    }
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if ((ch === "&" || ch === "§") && i + 1 < input.length) {
      const code = input[i + 1].toLowerCase();
      // &k (obfuscated) has no web equivalent — consume it silently.
      if (code === "k") {
        i++;
        continue;
      }
      if (MC_COLORS[code] !== undefined || "lmonr".includes(code)) {
        flush();
        if (MC_COLORS[code] !== undefined) {
          color = MC_COLORS[code];
          // color codes reset styles in vanilla
          bold = italic = underline = strike = false;
        } else if (code === "l") bold = true;
        else if (code === "o") italic = true;
        else if (code === "n") underline = true;
        else if (code === "m") strike = true;
        else if (code === "r") {
          color = undefined;
          bold = italic = underline = strike = false;
        }
        i++;
        continue;
      }
    }
    buf += ch;
  }
  flush();
  if (segments.length === 0) segments.push({ text: input });
  return segments;
}

/** Strip codes to plain text (for aria labels, titles, meta). */
export function stripMcCodes(input: string): string {
  return input.replace(/[&§][0-9a-fk-or]/gi, "");
}
