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
  const resizeMousePrevValue = useRef<number>(0);

  const resizeCanvasElement = (event: React.PointerEvent)=>{
    
    if(elementState === CurrentState.RESIZING){

      const selectedElementID = event.currentTarget.parentElement?.dataset.elementId as string;

      const difference = event.clientX - resizeMousePrevValue.current;
      console.log(difference);
      resizeMousePrevValue.current = event.clientX;
      
      setElements((prev) => ({
        ...prev,
        [selectedElementID]: {
          ...prev[selectedElementID],
          size:{ width: (prev[selectedElementID].size?.width ?? 0) + 1 , height: (prev[selectedElementID].size?.height ?? 0) + 1 }  
        },
      }));
      
    }
  }
  
  
  const resizeSectionSelected = (event: React.PointerEvent)=>{
    resizeMousePrevValue.current = event.clientX;
    setElementState(CurrentState.RESIZING);
  }


  return (
    <div
      id="canvas-container"
      onPointerDown={event => handlePointerDownContainer({ event, setElements, selectedMode, selectedTarget, pointerOffset, mode:activeTool  })}
      onPointerMove={event => handlePointerMove({ event, pointerOffset, selectedMode,selectedTarget, setElements, elementState})}
      onPointerUp={event => handlePointerUp({ selectedMode, selectedTarget, setElementState })}
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
          onUpdateSize={ resizeCanvasElement }
          onSelectResizeCorner={resizeSectionSelected}
        />
      ))}
    </div>
  );
}
