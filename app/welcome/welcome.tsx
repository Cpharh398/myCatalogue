import { useRef, useState } from "react";
import { Toolbar } from "~/components/appToolBar";
import { CanvasElement } from "~/components/CanvasElement";
import { handlePointerMove, handlePointerDownContainer,handlePointerUp, updateElementStyle, removeElement } from "~/features/pageEditing"
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
  
  const currentHovered = useRef<string | null>(null);
  const currentDragged = useRef<string | null>(null);
  const zIndexUpdated = useRef<boolean>(false);


  return (
    <div
      id="canvas-container"
      onPointerDown={event => handlePointerDownContainer({ event,cursorStyle, setElements, selectedMode, selectedTarget, pointerOffset, activeTool:activeTool, setActiveTool , setElementState, selectedResizeBorder })}
      onPointerMove={event => handlePointerMove({ event, pointerOffset, selectedMode, elements, selectedTarget, setElements, elementState, selectedResizeBorder, currentHovered, zIndexUpdated, currentDragged })}
      onPointerUp={event => handlePointerUp({ selectedMode, selectedTarget, setElementState, cursorStyle,selectedResizeBorder, setElements, currentHovered, elements, currentDragged   })}
      className={`bg-slate-100 w-full h-screen relative overflow-hidden select-none  ${cursorStyle.current !== null ? cursorStyle.current : activeTool != Modes.GRAB ? "cursor-crosshair" : "" }`}
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
          removeElement={ (event) => removeElement({ event, setElements, elements,  })}
          setElements={setElements}
        />
      ))}
    </div>
  );
}
