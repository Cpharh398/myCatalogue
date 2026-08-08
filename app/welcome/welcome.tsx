import React, { useRef, useState } from "react";

type Position = {
  x?: number;
  y?: number;
};

type BorderRadius = {
  radiusTL: number;
  radiusTR: number;
  radiusBL: number;
  radiusBR: number;
};

type ElementState = {
  position: Position;
  borderRadius: BorderRadius;
  borderColor: string;
  borderWidth: number;
  borderStyle: string;
  backgroundColor: string;
  useGradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  showToolBox?: boolean;
};

enum Modes {
  normal,
}

export function Canvas() {
  const [elements, setElements] = useState<Record<string, ElementState>>({});

  const selectedMode = useRef<Modes>(Modes.normal);
  const selectedTarget = useRef<string | null>(null);
  const pointerOffset = useRef<Position>({ x: 0, y: 0 });

  const updateElementsPosition = (event: React.PointerEvent) => {
    if (!selectedTarget.current) return;
    const boxId = selectedTarget.current;

    const container = document.getElementById("canvas-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const x = event.clientX - rect.left - (pointerOffset.current.x ?? 0);
    const y = event.clientY - rect.top - (pointerOffset.current.y ?? 0);

    setElements((prev) => ({
      ...prev,
      [boxId]: {
        ...prev[boxId],
        position: { x, y },
        showToolBox: true,
      },
    }));
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!selectedTarget.current) return;

    if (selectedMode.current === Modes.normal) {
      updateElementsPosition(event);
    }
  };

  const createNewBox = (event: React.PointerEvent) => {
    const boxID = crypto.randomUUID();
    const container = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - container.left - 80;
    const y = event.clientY - container.top - 80;

    setElements((prev) => ({
      ...prev,
      ...Object.keys(prev).reduce((acc, key) => {
        acc[key] = { ...prev[key], showToolBox: false };
        return acc;
      }, {} as Record<string, ElementState>),
      [boxID]: {
        showToolBox: true,
        position: { x, y },
        borderRadius: { radiusBL: 0, radiusBR: 0, radiusTL: 0, radiusTR: 0 },
        borderColor: "#3b82f6",
        borderWidth: 2,
        borderStyle: "solid",
        backgroundColor: "#f59e0b",
        useGradient: false,
        gradientStart: "#ec4899",
        gradientEnd: "#8b5cf6",
        gradientAngle: 135,
      },
    }));
  };

  const handlePointerDownContainer = (event: React.PointerEvent) => {
    const target = event.target as HTMLElement;

    if (target.id === "canvas-container") {
      createNewBox(event);
      return;
    }

    const elementNode = target.closest("[data-element-id]");
    if (!elementNode) return;

    const boxId = elementNode.getAttribute("data-element-id")!;

    selectedMode.current = Modes.normal;
    selectedTarget.current = boxId;

    const rect = elementNode.getBoundingClientRect();
    pointerOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setElements((prev) => {
      const nextState: Record<string, ElementState> = {};
      Object.keys(prev).forEach((id) => {
        nextState[id] = {
          ...prev[id],
          showToolBox: id === boxId,
        };
      });
      return nextState;
    });
  };

  const handlePointerUp = () => {
    selectedMode.current = Modes.normal;
    selectedTarget.current = null;
  };

  const updateElementStyle = ( id: string, updater: (prev: ElementState) => Partial<ElementState>) => {
    
    setElements( (prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updater(prev[id]),
      },
    }));

  };


  return (
    <div
      id="canvas-container"
      onPointerDown={handlePointerDownContainer}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="bg-slate-100 w-full h-screen relative overflow-hidden select-none"
    >
      {Object.entries(elements).map(([id, element]) => (
        <CanvasElement
          key={id}
          id={id}
          element={element}
          onUpdateStyle={(updater) => updateElementStyle(id, updater)}
        />
      ))}
    </div>
  );
}

type ElementProps = {
  id: string;
  element: ElementState;
  onUpdateStyle: (
    updater: (prev: ElementState) => Partial<ElementState>
  ) => void;
};

export function CanvasElement({ id, element, onUpdateStyle }: ElementProps) {
  const getBackgroundStyle = () => {
    if (element.useGradient) {
      return `linear-gradient(${element.gradientAngle}deg, ${element.gradientStart}, ${element.gradientEnd})`;
    }
    return element.backgroundColor;
  };

  return (
    <div
      data-element-id={id}
      style={{
        top: element.position.y,
        left: element.position.x,
        borderTopLeftRadius: `${element.borderRadius.radiusTL}%`,
        borderTopRightRadius: `${element.borderRadius.radiusTR}%`,
        borderBottomLeftRadius: `${element.borderRadius.radiusBL}%`,
        borderBottomRightRadius: `${element.borderRadius.radiusBR}%`,
        borderWidth: `${element.borderWidth}px`,
        borderColor: element.borderColor,
        borderStyle: element.borderStyle,
        background: getBackgroundStyle(),
      }}
      className="absolute w-44 h-44 shadow-md cursor-grab active:cursor-grabbing flex flex-col justify-between"
    >
      <ToolBox
        isVisible={element.showToolBox ?? false}
        element={element}
        onUpdateStyle={onUpdateStyle}
      />
    </div>
  );
}

type ToolBoxProps = {
  isVisible: boolean;
  element: ElementState;
  onUpdateStyle: (
    updater: (prev: ElementState) => Partial<ElementState>
  ) => void;
};

export function ToolBox({ isVisible, element, onUpdateStyle }: ToolBoxProps) {

  if (!isVisible) return null;
  
  const selectedCorners = useRef<Set<keyof BorderRadius>>(new Set());

  const handleRadiusChange = (value: number) => {
  const clamped = Math.min(Math.max(value, 0), 100);

  onUpdateStyle((prev) => {
    const borderRadius = { ...prev.borderRadius };

    selectedCorners.current.forEach((corner) => {
      borderRadius[corner] = clamped;
    });

    return {
      ...prev,
      borderRadius,
    };
  });
};

const ToogleCorner = (coner: keyof BorderRadius)=>{
    if(selectedCorners.current.has(coner)){
      selectedCorners.current.delete(coner);
    } else{
      selectedCorners.current.add(coner)
    } 
    

}

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white p-2.5 rounded-xl shadow-xl flex items-center gap-3 z-30 text-xs whitespace-nowrap"
    >
      <div className="flex flex-col items-center gap-2.5">
        <span className="text-[10px] text-slate-400">Radius (%)</span>
        <div className="flex gap-2">

          <div onClick={() => ToogleCorner("radiusTL")}  className="bg-slate-800 w-4 outline-1 aspect-square  border-l-2 border-t-2   " />
          <div onClick={() => ToogleCorner("radiusTR")} className="bg-slate-800 w-4 aspect-square  border-b-2 border-r-2   " />
          <div onClick={() => ToogleCorner("radiusBL")} className="bg-slate-800 w-4 aspect-square  border-t-2 border-l-2   " />
          <div onClick={() => ToogleCorner("radiusBR")} className="bg-slate-800 w-4 aspect-square  border-b-2 border-l-2   " />

          <input
            type="number"
            min={0}
            max={100}
            onChange={(e) =>
              handleRadiusChange(Number(e.target.value))
            }
            className="w-8 bg-slate-700 text-white text-[10px] rounded px-1 text-center"
          />



        </div>
      </div>

      <div className="w-[1px] h-8 bg-slate-600" />

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
          max={20}
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

      <div className="w-[1px] h-8 bg-slate-600" />

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
    </div>
  );
}