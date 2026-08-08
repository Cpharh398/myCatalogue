import { useRef, useState } from "react";
import { Toolbar } from "~/components/appToolBar";
import { CanvasElement } from "~/components/CanvasElement";
import { handlePointerMove, handlePointerDownContainer,handlePointerUp, updateElementStyle } from "~/features/pageEditing"
import Modes, { type ElementState, type Position } from "~/util/types"


export function Canvas() {
  
  const [elements, setElements] = useState<Record<string, ElementState>>({});
  const [activeTool, setActiveTool] = useState<Modes>(Modes.GRAB);
  const selectedMode = useRef<Modes>(Modes.GRAB);
  const selectedTarget = useRef<string | null>(null);
  const pointerOffset = useRef<Position>({ x: 0, y: 0 });

  return (
    <div
      id="canvas-container"
      onPointerDown={event => handlePointerDownContainer({ event, setElements, selectedMode, selectedTarget, pointerOffset, mode:activeTool  })}
      onPointerMove={event => handlePointerMove({ event, pointerOffset, selectedMode,selectedTarget, setElements})}
      onPointerUp={event => handlePointerUp({ selectedMode, selectedTarget })}
      className="bg-slate-100 w-full h-screen relative overflow-hidden select-none"
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
