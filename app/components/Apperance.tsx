import { BLEND_MODES, FONT_FAMILIES, FONT_WEIGHTS, OBJECT_FIT_OPTIONS } from "~/features/pageEditing/constants";
import type { BorderRadius, ElementAttr } from "~/util/types";
import { NumberInput } from "./numberInput";
import TextSlider from "./valueSlider";
import { ColorPicker } from "antd";


export function AppearanceControl({
  currentUniformRadius,
  showIndividualRadius,
  element,
  setShowIndividualRadius,
  updateProp,
}: {
  currentUniformRadius: number;
  showIndividualRadius: boolean;
  element: ElementAttr;
  currentElement: string;
  setShowIndividualRadius: React.Dispatch<React.SetStateAction<boolean>>;
  updateProp: (key: keyof ElementAttr, value: ElementAttr[keyof ElementAttr], updateFromPrev?: boolean, min?: number) => void;
}) {
  const tag = (element.elementTag || "div").toLowerCase();

  const isTextTag = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "button", "text", "input"].includes(tag);
  const isMediaTag = ["img", "image", "video"].includes(tag);

  const isTextElement = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "text"].includes(tag);
  const isButtonElement = ["button"].includes(tag);
  const isDivElement = ["div"].includes(tag);
  const isVideoElement = ["video"].includes(tag);
  const isAudioElement = ["audio"].includes(tag);

  return (
    <div className="p-3 border-b border-[#383838] flex flex-col gap-3.5 font-sans text-[11px] text-[#b3b3b3] select-none">
      <span className="font-semibold text-white text-[12px]">Appearance</span>

      {(!isDivElement || !isAudioElement) && (
        <BlendModeControl element={element} updateProp={updateProp} />
      )}

      {isMediaTag && (
        <MediaFittingControl element={element} updateProp={updateProp} />
      )}

      {isTextTag && (
        <TypographyControl element={element} updateProp={updateProp} />
      )}

      {(isButtonElement || isDivElement || isVideoElement) && (
        <CornerRadiusControl
          element={element}
          currentUniformRadius={currentUniformRadius}
          showIndividualRadius={showIndividualRadius}
          setShowIndividualRadius={setShowIndividualRadius}
          updateProp={updateProp}
        />
      )}

      {!isTextElement && (
        <BoxShadowControl element={element} updateProp={updateProp} />
      )}

        {isTextElement && <TextEffectsControl element={element} updateProp={updateProp} />}
    </div>
  );
}


interface BlendModeControlProps {
  element: ElementAttr;
  updateProp: (key: keyof ElementAttr, value: ElementAttr[keyof ElementAttr], updateFromPrev?: boolean, min?: number) => void;
}

export function BlendModeControl({ element, updateProp }: BlendModeControlProps) {
  return (
    <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]"
      >
        <span className="text-[#808080] text-[9px]">Blend Mode</span>
        <select
          value={element.lgSreenStyle?.mixBlendMode || "normal"}
          onChange={(e) =>  updateProp("lgSreenStyle", {mixBlendMode: (e.target.value as React.CSSProperties["mixBlendMode"] ) })}
          className="bg-transparent text-white text-[10px] outline-none cursor-pointer text-right capitalize"
        >
          {BLEND_MODES.map((mode) => (
            <option key={mode} value={mode} className="bg-[#1e1e1e] text-white">
              {mode}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

interface MediaFittingControlProps {
  element: ElementAttr;
   updateProp: (key: keyof ElementAttr, value: ElementAttr[keyof ElementAttr], updateFromPrev?: boolean, min?: number) => void;
}

export function MediaFittingControl({ element, updateProp }: MediaFittingControlProps) {
  return (
    <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
      <span className="text-[10px] font-semibold text-white">Media Fitting</span>
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
          <span className="text-[#808080] text-[9px]">Object Fit</span>
          <select
            value={element.lgSreenStyle?.objectFit || "cover"}
            onChange={(e) => updateProp("lgSreenStyle", { objectFit: (e.target.value as React.CSSProperties["objectFit"] ) } )}

          className="bg-transparent text-white text-[10px] outline-none cursor-pointer capitalize"
          >
            {OBJECT_FIT_OPTIONS.map((fit) => (
                <option key={fit} value={fit} className="bg-[#1e1e1e] text-white">
                {fit}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}


interface TypographyControlProps {
    element: ElementAttr;
    updateProp: (key: keyof ElementAttr, value: ElementAttr[keyof ElementAttr], updateFromPrev?: boolean, min?: number) => void;
}

export function TypographyControl({ element, updateProp }: TypographyControlProps) {
    console.log(element.lgSreenStyle?.letterSpacing)

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]"
    >
      <span className="text-[10px] font-semibold text-white">Typography</span>

      {/* Font Family */}
      <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
        <span className="text-[#808080] text-[9px]">Font</span>
        <select
          value={element.lgSreenStyle?.fontFamily || "Inter"}
          onChange={(e) => updateProp("lgSreenStyle", {fontFamily: (e.target.value as React.CSSProperties["fontFamily"] ) } )}

          className="bg-transparent text-white text-[10px] outline-none cursor-pointer max-w-27.5 truncate text-right"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} className="bg-[#1e1e1e] text-white">
              {font}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {/* Font Weight */}
        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
          <span className="text-[#808080] text-[9px]">Weight</span>
          <select
            value={element.lgSreenStyle?.fontWeight || "400"}
          onChange={(e) =>  updateProp("lgSreenStyle", {fontWeight: (e.target.value as React.CSSProperties["fontWeight"] ) } )}

            // onChange={(e) => onStyleChange("fontWeight", e.target.value)}
            className="bg-transparent text-white text-[10px] outline-none cursor-pointer text-right max-w-17.5 truncate"
          >
            {FONT_WEIGHTS.map((w) => (
              <option key={w.value} value={w.value} className="bg-[#1e1e1e] text-white">
                {w.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
          <span className="text-[#808080] text-[9px]">Size</span>
          <TextSlider
            text="Size"
            onUpdate={(value) =>  updateProp("lgSreenStyle", { fontSize: Number(value) }, true, 0 )}
          />
          <div className="flex items-center gap-0.5">
            <NumberInput
            min={1}
            onChange={(value) =>  updateProp("lgSreenStyle", { fontSize: Number(value) } )}
            value={element.lgSreenStyle?.fontSize ?? 14}
            
            />
    
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Line Height */}
        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
          <span className="text-[#808080] text-[9px]">Line Height</span>
          <input
            type="text"
            value={element.lgSreenStyle?.lineHeight ?? "1.5"}
            onChange={(e) => updateProp("lgSreenStyle", { lineHeight:e.target.value }) }
            placeholder="1.5"
            className="w-10 bg-transparent text-white text-right outline-none text-[10px]"
          />
        </div>

        {/* Letter Spacing */}
        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
          <span className="text-[#808080] text-[9px]">Spacing</span>
          <div className="flex items-center gap-0.5">
            <NumberInput
            min={0}
            step={0.5}
            unit="px"
            onChange={value => updateProp("lgSreenStyle", { letterSpacing: value } ) }
            value={element.lgSreenStyle?.letterSpacing ?? 0}
            className="w-16"
            />
            
          </div>
        </div>
      </div>
    </div>
  );
}

interface CornerRadiusControlProps {
  element: ElementAttr;
  currentUniformRadius: number;
  showIndividualRadius: boolean;
  setShowIndividualRadius: React.Dispatch<React.SetStateAction<boolean>>;
  updateProp: (key: keyof ElementAttr, value: any, updateFromPrev?: boolean, min?: number) => void;
}

export function CornerRadiusControl({
  element,
  currentUniformRadius,
  showIndividualRadius,
  setShowIndividualRadius,
  updateProp,
}: CornerRadiusControlProps) {
  return (
    <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white">Corner Radius</span>
        <button
          title="Toggle Individual Corners"
          onClick={() => setShowIndividualRadius((show) => !show)}
          className={`p-1 rounded hover:bg-[#383838] transition-colors ${
            showIndividualRadius ? "text-[#0c8ce9]" : "text-[#808080]"
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {!showIndividualRadius ? (
        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
          <TextSlider
            text="Radius All"
            onUpdate={(value) =>
              updateProp(
                "borderRadius",
                {
                  radiusTL: value / 16,
                  radiusTR: value / 16,
                  radiusBL: value / 16,
                  radiusBR: value / 16,
                },
                true,
                0
              )
            }
          />
          <div className="flex items-center gap-0.5">
            <NumberInput
              min={0}
              value={currentUniformRadius.toFixed(2)}
              onChange={(value) => {
                updateProp("borderRadius", {
                  radiusTL: value,
                  radiusTR: value,
                  radiusBL: value,
                  radiusBR: value,
                });
              }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "tl", key: "radiusTL" },
            { label: "tr", key: "radiusTR" },
            { label: "bl", key: "radiusBL" },
            { label: "br", key: "radiusBR" },
          ].map((corner) => (
            <div
              key={corner.key}
              className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]"
            >
              <span
                data-controlknob={corner.label}
                className="text-[#808080] w-9 hover:cursor-ew-resize text-[9px]"
              >
                {corner.label.toUpperCase()}
              </span>
              <input
                type="number"
                min={0}
                value={element.borderRadius?.[corner.key as keyof BorderRadius] ?? 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateProp("lgSreenStyle", {
                    ...element.lgSreenStyle,
                    borderRadius: `${val}px`,
                  } as React.CSSProperties);
                  updateProp("borderRadius", { [corner.key]: val });
                }}
                className="w-8 bg-transparent text-white text-right outline-none text-[10px]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface BoxShadowControlProps {
  element: ElementAttr;
  updateProp: (key: keyof ElementAttr, value: any, updateFromPrev?: boolean, min?: number) => void;
}

export function BoxShadowControl({ element, updateProp }: BoxShadowControlProps) {
  const parseShadow = (str?: string) => {
    if (!str || str === "none") {
      return { x: 0, y: 2, blur: 4, spread: 0, color: "rgba(0,0,0,0.4)" };
    }
    const matches = str.match(/(-?\d+px)/g);
    const cleanedStr = str.replace(/-?\d+px/g, "").trim();
    const colorMatch = cleanedStr.match(/rgba?\([^)]+\)|hsla?\([^)]+\)|#[a-fA-F0-9]{3,8}|[a-zA-Z]+/i);

    return {
      x: matches?.[0] ? parseInt(matches[0], 10) : 0,
      y: matches?.[1] ? parseInt(matches[1], 10) : 2,
      blur: matches?.[2] ? parseInt(matches[2], 10) : 4,
      spread: matches?.[3] ? parseInt(matches[3], 10) : 0,
      color: colorMatch?.[0] || "rgba(0,0,0,0.4)",
    };
  };

  const bs = parseShadow(element.lgSreenStyle?.boxShadow as string);

  const updateBoxShadow = (key: string, val: any) => {
    const updated = { ...bs, [key]: val };
    const shadowString = `${updated.x}px ${updated.y}px ${updated.blur}px ${updated.spread}px ${updated.color}`;
    updateProp("lgSreenStyle", { boxShadow: shadowString });
  };

  return (
    <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
      <span className="text-[10px] font-semibold text-white">Box Shadow</span>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-2">
          {/* X / Y Offsets */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]"
          >
            <span className="text-[#808080] text-[9px]">X / Y</span>
            <div className="flex items-center gap-1">
              <NumberInput value={bs.x} onChange={(val) => updateBoxShadow("x", val)} className="w-11" />
              <NumberInput value={bs.y} onChange={(val) => updateBoxShadow("y", val)} className="w-11" />
            </div>
          </div>

          {/* Blur / Spread */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]"
          >
            <span className="text-[#808080] text-[9px]">Blur/Spread</span>
            <div className="flex items-center gap-1">
              <NumberInput value={bs.blur} onChange={(val) => updateBoxShadow("blur", val)} className="w-11" />
              <span className="text-[#808080]">/</span>
              <NumberInput value={bs.spread} onChange={(val) => updateBoxShadow("spread", val)} className="w-11" />
            </div>
          </div>
        </div>

        {/* Color Picker & Reset */}
        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
          <span className="text-[#808080] text-[9px]">Shadow Color</span>
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            className="flex items-center gap-2"
          >
            <ColorPicker
              defaultValue="#ffffff00"
              value={bs.color}
              size="small"
              onChangeComplete={(val) => updateBoxShadow("color", val.toRgbString())}
            />
            <button
              onClick={() => updateProp("lgSreenStyle", { boxShadow: "none" })}
              className="text-[9px] text-[#808080] hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TextEffectsControlProps {
  element: ElementAttr;
  updateProp: (key: keyof ElementAttr, value: any, updateFromPrev?: boolean, min?: number) => void;
}

export function TextEffectsControl({ element, updateProp }: TextEffectsControlProps) {
  const currentBg = (element.lgSreenStyle?.backgroundImage as string) || "";
  const isRadial = currentBg.includes("radial-gradient");
  const angleMatch = currentBg.match(/(\d+)deg/);
  const currentAngle = angleMatch ? Number(angleMatch[1]) : 90;

  const colors = currentBg.match(/(rgba?\([^)]+\)|#[a-fA-F0-9]{3,8})/g) || [
    "rgba(0, 198, 255, 1)",
    "rgba(0, 114, 255, 1)",
  ];
  const color1 = colors[0] || "rgba(0, 198, 255, 1)";
  const color2 = colors[1] || "rgba(0, 114, 255, 1)";

  const updateGradient = (type: "linear" | "radial", angle: number, c1: string, c2: string) => {
    const gradientStr =
      type === "linear"
        ? `linear-gradient(${angle}deg, ${c1}, ${c2})`
        : `radial-gradient(circle, ${c1}, ${c2})`;

    updateProp("lgSreenStyle", {
      backgroundImage: gradientStr,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    });
  };

  return (
    <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-white">Effects & Filters</span>

      {/* 1. Text Solid Color */}
      <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
        <span className="text-[10px] font-semibold text-white">Text Color</span>
        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
          <span className="text-[#808080] text-[9px]">Solid Fill</span>
          <div className="flex items-center gap-2">
            <ColorPicker
              defaultValue="#ffffff00"
              value={(element.lgSreenStyle?.color as string) || "rgba(255, 255, 255, 1)"}
              size="small"
              onChangeComplete={(val) => {
                updateProp("lgSreenStyle", {
                  backgroundImage: "none",
                  WebkitBackgroundClip: "unset",
                  WebkitTextFillColor: "unset",
                  color: val.toRgbString(),
                });
              }}
            />
            <button
              onClick={() => updateProp("lgSreenStyle", { color: "inherit" })}
              className="text-[9px] text-[#808080] hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 2. Gradient Text */}
      <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
        <span className="text-[10px] font-semibold text-white">Gradient Text</span>
        <div className="flex flex-col gap-2">
          {/* Type Toggle */}
          <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
            <span className="text-[#808080] text-[9px]">Type</span>
            <div className="flex items-center gap-1 bg-[#1e1e1e] p-0.5 rounded border border-[#383838]">
              <button
                type="button"
                onClick={() => updateGradient("linear", currentAngle, color1, color2)}
                className={`px-2 py-0.5 text-[8px] rounded transition-colors ${
                  !isRadial ? "bg-[#383838] text-white font-medium" : "text-[#808080] hover:text-white"
                }`}
              >
                Linear
              </button>
              <button
                type="button"
                onClick={() => updateGradient("radial", currentAngle, color1, color2)}
                className={`px-2 py-0.5 text-[8px] rounded transition-colors ${
                  isRadial ? "bg-[#383838] text-white font-medium" : "text-[#808080] hover:text-white"
                }`}
              >
                Radial
              </button>
            </div>
          </div>

          {/* Angle Input (Linear Only) */}
          {!isRadial && (
            <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
              <span className="text-[#808080] text-[9px]">Angle</span>
              <NumberInput
                min={0}
                max={360}
                value={currentAngle}
                onChange={(val) => updateGradient("linear", Number(val), color1, color2)}
                className="w-11"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}