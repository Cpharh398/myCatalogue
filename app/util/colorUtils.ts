export interface HSLA {
  h: number; // 0 - 360
  s: number; // 0 - 100
  v: number; // 0 - 100
  a: number; // 0 - 1
}

// Convert Hex string (e.g., #ff0000 or #ff0000ff) to HSLA
export function hexToHsla(hex: string): HSLA {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  if (c.length === 6) c += "ff";

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const a = parseInt(c.substring(6, 8), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  let h = 0;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a: Number(a.toFixed(2)),
  };
}

// Convert HSLA to standard CSS string: hsla(180, 100%, 50%, 0.8)
export function hslaToCss(hsla: HSLA): string {
  // Convert HSV (Value) to HSL (Lightness) for CSS output
  const l = (2 - hsla.s / 100) * (hsla.v / 100) / 2;
  const sl = l !== 0 && l !== 1 
    ? (hsla.s / 100 * hsla.v / 100) / (l < 0.5 ? l * 2 : 2 - l * 2) 
    : 0;

  return `hsla(${hsla.h}, ${Math.round(sl * 100)}%, ${Math.round(l * 100)}%, ${hsla.a})`;
}