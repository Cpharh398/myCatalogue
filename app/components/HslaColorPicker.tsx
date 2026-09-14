import React, { useRef, useState, useEffect } from "react";
import { hexToHsla, hslaToCss, type HSLA } from "~/util/colorUtils";

type HslaColorPickerProps = {
  color: string; // Accepts hex, hsla, or rgba string
  onChange: (cssColor: string) => void;
  label?: string;
};

export function HslaColorPicker({ color, onChange, label }: HslaColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to parse any valid incoming color string into HSLA
  const parseAnyColor = (inputColor: string): HSLA => {
    if (!inputColor) return { h: 0, s: 0, v: 100, a: 1 };
    const trimmed = inputColor.trim();
    if (trimmed.startsWith("#")) return hexToHsla(trimmed);
    if (trimmed.startsWith("hsl")) return parseHslaString(trimmed);
    if (trimmed.startsWith("rgb")) return parseRgbaString(trimmed);

    // Fallback: Use browser offscreen element to normalize named colors or hexes
    return hexToHsla(colorToHex(trimmed));
  };

  const hsla = parseAnyColor(color);
  const [textInput, setTextInput] = useState(color || "#ffffff");

  // Keep internal text input state in sync with external color changes
  useEffect(() => {
    setTextInput(color || "#ffffff");
  }, [color]);

  const satAreaRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const alphaSliderRef = useRef<HTMLDivElement>(null);

  const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

  // Handle direct text typing / pasting
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextInput(value);

    // Validate if browser can compute the input as a color
    if (isValidColor(value)) {
      if (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl")) {
        onChange(value);
      } else {
        onChange(colorToHex(value));
      }
    }
  };

  // 1. DRAG HANDLER FOR 2D SATURATION / BRIGHTNESS BOX
  const handleSatPointerMove = (e: React.PointerEvent) => {
    if (!satAreaRef.current) return;
    const rect = satAreaRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);

    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);

    const updated = { ...hsla, s, v };
    const css = hslaToCss(updated);
    setTextInput(css);
    onChange(css);
  };

  // 2. DRAG HANDLER FOR HUE SLIDER (0 - 360 deg)
  const handleHuePointerMove = (e: React.PointerEvent) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);

    const h = Math.round((x / rect.width) * 360);
    const updated = { ...hsla, h };
    const css = hslaToCss(updated);
    setTextInput(css);
    onChange(css);
  };

  // 3. DRAG HANDLER FOR ALPHA SLIDER (0.0 - 1.0)
  const handleAlphaPointerMove = (e: React.PointerEvent) => {
    if (!alphaSliderRef.current) return;
    const rect = alphaSliderRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);

    const a = Number((x / rect.width).toFixed(2));
    const updated = { ...hsla, a };
    const css = hslaToCss(updated);
    setTextInput(css);
    onChange(css);
  };

  const bindPointerCapture = (handler: (e: React.PointerEvent) => void) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    handler(e);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* TRIGGER BUTTON / COLOR SWATCH */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onPointerDown={stopPropagation}
        className="w-5 h-5 rounded cursor-pointer border border-[#383838] shadow-sm relative overflow-hidden focus:outline-none hover:scale-105 transition-transform shrink-0"
        style={{
          backgroundImage: `linear-gradient(45deg, #2c2c2c 25%, transparent 25%), linear-gradient(-45deg, #2c2c2c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2c2c2c 75%), linear-gradient(-45deg, transparent 75%, #2c2c2c 75%)`,
          backgroundSize: `8px 8px`,
          backgroundPosition: `0 0, 0 4px, 4px -4px, -4px 0px`,
        }}
        title={`Edit ${label || "Color"}`}
      >
        <div className="w-full h-full" style={{ backgroundColor: hslaToCss(hsla) }} />
      </button>

      {/* COLOR PICKER POPOVER PANEL */}
      {isOpen && (
        <div
          onClick={stopPropagation}
          onPointerDown={stopPropagation}
          className="absolute z-50 bottom-8 left-0 w-52 bg-[#1e1e1e] border border-[#383838] p-2.5 rounded-lg shadow-2xl flex flex-col gap-2.5 text-[10px] select-none"
        >
          {/* A. 2D SATURATION & VALUE CANVAS BOX */}
          <div
            ref={satAreaRef}
            onPointerDown={bindPointerCapture(handleSatPointerMove)}
            onPointerMove={(e) => e.buttons === 1 && handleSatPointerMove(e)}
            className="relative w-full h-28 rounded cursor-crosshair overflow-hidden border border-[#383838]"
            style={{ backgroundColor: `hsl(${hsla.h}, 100%, 50%)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

            <div
              className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${hsla.s}%`,
                top: `${100 - hsla.v}%`,
                backgroundColor: hslaToCss(hsla),
              }}
            />
          </div>

          {/* B. HUE SLIDER */}
          <div className="flex flex-col gap-1">
            <span className="text-[#808080] text-[9px] font-medium">Hue</span>
            <div
              ref={hueSliderRef}
              onPointerDown={bindPointerCapture(handleHuePointerMove)}
              onPointerMove={(e) => e.buttons === 1 && handleHuePointerMove(e)}
              className="relative w-full h-3 rounded cursor-pointer border border-[#383838]"
              style={{
                background: `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
              }}
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white bg-transparent shadow-md pointer-events-none"
                style={{ left: `${(hsla.h / 360) * 100}%` }}
              />
            </div>
          </div>

          {/* C. ALPHA / OPACITY SLIDER */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[#808080] text-[9px]">
              <span>Opacity</span>
              <span>{Math.round(hsla.a * 100)}%</span>
            </div>
            <div
              ref={alphaSliderRef}
              onPointerDown={bindPointerCapture(handleAlphaPointerMove)}
              onPointerMove={(e) => e.buttons === 1 && handleAlphaPointerMove(e)}
              className="relative w-full h-3 rounded cursor-pointer border border-[#383838] overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(45deg, #2c2c2c 25%, transparent 25%), linear-gradient(-45deg, #2c2c2c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2c2c2c 75%), linear-gradient(-45deg, transparent 75%, #2c2c2c 75%)`,
                backgroundSize: `8px 8px`,
                backgroundPosition: `0 0, 0 4px, 4px -4px, -4px 0px`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, transparent, ${hslaToCss({ ...hsla, a: 1 })})`,
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white bg-transparent shadow-md pointer-events-none"
                style={{ left: `${hsla.a * 100}%` }}
              />
            </div>
          </div>

          {/* D. EDITABLE COLOR VALUE INPUT FIELD */}
          <div className="flex flex-col gap-1">
            <span className="text-[#808080] text-[9px] font-medium">Color Value</span>
            <input
              type="text"
              value={textInput}
              onChange={handleTextInputChange}
              placeholder="#FFFFFF, rgba(...), hsla(...)"
              className="w-full bg-[#141414] border border-[#383838] focus:border-[#0c8ce9] rounded px-1.5 py-1 text-white font-mono text-[10px] outline-none"
            />
          </div>

          {/* E. CLOSE BUTTON */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-1 bg-[#2c2c2c] hover:bg-[#383838] text-white rounded text-[10px] transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

// Color parsing utility helpers
function isValidColor(str: string): boolean {
  const s = new Option().style;
  s.color = str;
  return s.color !== "";
}

function colorToHex(str: string): string {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "#ffffff";
  ctx.fillStyle = str;
  return ctx.fillStyle;
}

function parseHslaString(str: string): HSLA {
  const match = str.match(/hsla?\(([^)]+)\)/);
  if (!match) return { h: 0, s: 100, v: 100, a: 1 };
  const [h, s, l, a = 1] = match[1].split(",").map((v) => parseFloat(v));
  const v = l + (s / 100) * Math.min(l, 100 - l);
  const sat = v === 0 ? 0 : 2 * (1 - l / v) * 100;

  return { h: h || 0, s: Math.round(sat), v: Math.round(v), a: Number(a) };
}

function parseRgbaString(str: string): HSLA {
  const match = str.match(/rgba?\(([^)]+)\)/);
  if (!match) return { h: 0, s: 0, v: 100, a: 1 };
  const [r, g, b, a = 1] = match[1].split(",").map((v) => parseFloat(v));
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  const hsla = hexToHsla(hex);
  return { ...hsla, a: Number(a) };
}