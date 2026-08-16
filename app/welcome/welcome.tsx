import { useRef, useState } from "react";
import { Toolbar } from "~/components/appToolBar";
import { CanvasElement } from "~/components/CanvasElement";
import { handlePointerMove, handlePointerDownContainer,handlePointerUp, updateElementStyle } from "~/features/pageEditing"
import { type ElementAttr, type Position, CurrentState, Modes } from "~/util/types"


export function Canvas() {
  
  const [elements, setElements] = useState<Record<string, ElementAttr>>({});
  const [elementState, setElementState] = useState<CurrentState>(CurrentState.DRAG);

  const [activeTool, setActiveTool] = useState<Modes>(Modes.GRAB);
  const selectedMode = useRef<Modes>(Modes.GRAB);
  const selectedTarget = useRef<string | null>(null);
  const pointerOffset = useRef<Position>({ x: 0, y: 0 });
  const selectedResizeBorder = useRef<string | null>(null);
  const cursorStyle = useRef<"cursor-ns-resize" | "cursor-ew-resize" | "cursor-nwse-resize" | "cursor-nesw-resize" | null>(null);

  return (
    <div
      id="canvas-container"
      onPointerDown={event => handlePointerDownContainer({ event,cursorStyle, setElements, selectedMode, selectedTarget, pointerOffset, activeTool:activeTool, setActiveTool , setElementState, selectedResizeBorder })}
      onPointerMove={event => handlePointerMove({ event, pointerOffset, selectedMode, selectedTarget, setElements, elementState, selectedResizeBorder })}
      onPointerUp={event => handlePointerUp({ selectedMode, selectedTarget, setElementState, cursorStyle,selectedResizeBorder  })}
      className={`bg-slate-100 w-full h-screen relative overflow-hidden select-none  ${cursorStyle.current !== null ? cursorStyle.current : "" }`}
    >
      <Toolbar
      activeTool={activeTool}
      onSelectTool={(tool)=> setActiveTool(tool)}
      />
      {Object.entries(elements).map(([id, element]) => (
        <CanvasElement
          key={id}
          id={id}
          element={element}
          onUpdateStyle={(updater) => updateElementStyle(id, updater, setElements)}
        />
      ))}
    </div>
  );
}
