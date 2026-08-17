import { useState } from "react";
import type { BorderRadius, ElementAttr } from "~/util/types";
import { X, Trash2 } from "lucide-react"

type ToolBoxProps = {
  isVisible: boolean;
  element: ElementAttr;
  onUpdateStyle: (
    updater: (prev: ElementAttr) => Partial<ElementAttr>
  ) => void;
  removeElement: (event: React.PointerEvent) => void
};


export function ToolBox({ isVisible, element, onUpdateStyle, removeElement }: ToolBoxProps) {

  if (!isVisible) return null;

  const [borderRadiusValue, setBorderRadiusValue ] = useState<number>(0);
  const [selectedCorners, setSelectedCorners] = useState<Partial<Record<keyof BorderRadius, number>>>({});

  const handleRadiusChange = (value: number) => {
    const clamped = Math.min(Math.max(value, 0), 100);
    setBorderRadiusValue(clamped);

  onUpdateStyle((prev) => {
    const borderRadius = { ...prev.borderRadius };

  (Object.keys(selectedCorners) as (keyof BorderRadius)[])
      .forEach((corner) => {
        borderRadius[corner] = borderRadiusValue;
      });

    return {
      ...prev,
      borderRadius,
    };
  });
};

const toggleCornerSelection = (corner: keyof BorderRadius) => {

  if (corner in selectedCorners) {
    const updated = { ...selectedCorners };

    delete updated[corner];
    setSelectedCorners(updated);

  } else {

    const updated = {
      ...selectedCorners,
      [corner]: element.borderRadius[corner],
    }
    setSelectedCorners(updated);
    handleRadiusChange(borderRadiusValue);
  }
};


const getCornerButtonClass = (
    corner: keyof BorderRadius,
    borderStyles: string
  ) => {
    const isSelected = corner in selectedCorners;
    return `w-4 h-4 cursor-pointer transition-all border-slate-300 ${borderStyles} ${
      isSelected
        ? "bg-blue-600 border-blue-300 ring-2 ring-blue-400 scale-110"
        : "bg-slate-800 hover:bg-slate-700 opacity-60 hover:opacity-100"
    }`;
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white p-2.5 rounded-xl shadow-xl flex items-center gap-3 z-30 text-xs whitespace-nowrap"
    >
      <div className="flex flex-col items-center gap-2.5">
        <span className="text-[10px] text-slate-400">Radius (%)</span>
        <div className="flex gap-2">

          <div className="flex items-center gap-1">
            <div
              title="Top-Left"
              onClick={() => toggleCornerSelection("radiusTL")}
              className={getCornerButtonClass("radiusTL", "border-l-2 border-t-2 rounded-tl-sm")}
            />
            <div
              title="Top-Right"
              onClick={() => toggleCornerSelection("radiusTR")}
              className={getCornerButtonClass("radiusTR", "border-r-2 border-t-2 rounded-tr-sm")}
            />
            <div
              title="Bottom-Left"
              onClick={() => toggleCornerSelection("radiusBL")}
              className={getCornerButtonClass("radiusBL", "border-l-2 border-b-2 rounded-bl-sm")}
            />
            <div
              title="Bottom-Right"
              onClick={() => toggleCornerSelection("radiusBR")}
              className={getCornerButtonClass("radiusBR", "border-r-2 border-b-2 rounded-br-sm")}
            />
          </div>
          <input
            type="number"
            min={0}
            max={100}
            value={`${borderRadiusValue}`}
            placeholder={`${borderRadiusValue}`}
            onChange={(e) =>
              handleRadiusChange(Number(e.target.value))
            }
            className="w-12 bg-slate-700 text-white text-[10px] rounded px-1 text-center"
          />

        </div>
      </div>

      <div className="w-px h-8 bg-slate-600" />

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-slate-400">Border</span>
        <input
          type="color"
          value={element.borderColor}
          onChange={(e) =>
            onUpdateStyle(() => ({ borderColor: e.target.value }))
          }
          className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-slate-400">Width</span>
        <input
          type="number"
          min={0}
          max={10}
          value={element.borderWidth}
          onChange={(e) =>
            onUpdateStyle(() => ({ borderWidth: Number(e.target.value) }))
          }
          className="w-10 bg-slate-700 text-white rounded px-1 text-center"
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-slate-400">Style</span>
        <select
          value={element.borderStyle}
          onChange={(e) =>
            onUpdateStyle(() => ({ borderStyle: e.target.value }))
          }
          className="bg-slate-700 text-white rounded px-1 text-[11px]"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>

      <div className="w-px h-8 bg-slate-600" />

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-slate-400">Gradient</span>
        <input
          type="checkbox"
          checked={element.useGradient}
          onChange={(e) =>
            onUpdateStyle(() => ({ useGradient: e.target.checked }))
          }
          className="cursor-pointer"
        />
      </div>

      { !element.useGradient ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-slate-400">BG</span>
          <input
            type="color"
            value={element.backgroundColor}
            onChange={(e) =>
              onUpdateStyle(() => ({ backgroundColor: e.target.value }))
            }
            className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-400">Start</span>
            <input
              type="color"
              value={element.gradientStart}
              onChange={(e) =>
                onUpdateStyle(() => ({ gradientStart: e.target.value }))
              }
              className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-400">End</span>
            <input
              type="color"
              value={element.gradientEnd}
              onChange={(e) =>
                onUpdateStyle(() => ({ gradientEnd: e.target.value }))
              }
              className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-400">Angle</span>
            <input
              type="number"
              min={0}
              max={360}
              value={element.gradientAngle}
              onChange={(e) =>
                onUpdateStyle(() => ({ gradientAngle: Number(e.target.value) }))
              }
              className="w-12 bg-slate-700 text-white rounded px-1 text-center"
            />
          </div>
        </>
      )}

      <button onPointerDown={removeElement} className="bg-slate-800 rounded-4xl hover:cursor-pointer flex justify-center items-center absolute -top-1 -right-1">
        <X color="red" size={15} />
      </button>
    </div>
  );
}