import { useEffect, useRef, useState } from "react";
import { Toolbar } from "~/components/appToolBar";
import { CanvasElement } from "~/components/CanvasElement";
import { ControlPanel } from "~/components/controlUnit";
import { AlignmentGuidesOverlay } from "~/components/guidLines";
import { HandleControlPanelPointerDown, HandleControlPanelPointerUp, HandlePointerMove } from "~/features/controlPanel/service";
import { handlePointerMove, handlePointerDownContainer, handlePointerUp, removeElement, } from "~/features/pageEditing/service"
import { findInTree, getContainerRelativePosition, removeElementFromTree, updateElementStyle } from "~/features/util";
import { useCanvasKeybindings } from "~/hooks/useCanvasKeyBindings";
import { type AlignmentGuide, type ElementAttr, type HoveredElementType, type Position, CurrentState, Knobs, Modes } from "~/util/types"



export function Canvas() {

  const [elements, setElements] = useState<Record<string, ElementAttr>>({});
  const [elementState, setElementState] = useState<CurrentState>(CurrentState.DRAG);
  const [guide, setGuide] = useState<AlignmentGuide[]>([]);
  const [activeTool, setActiveTool] = useState<Modes>(Modes.GRAB);
  const selectedMode = useRef<Modes>(Modes.GRAB);
  const selectedTarget = useRef<string | null>(null);
  const lastSelected = useRef<string | null>(null);
  const pointerOffset = useRef<Position>({ x: 0, y: 0 });
  const selectedResizeBorder = useRef<string | null>(null);
  const cursorStyle = useRef<"cursor-ns-resize" | "cursor-ew-resize" | "cursor-nwse-resize" | "cursor-nesw-resize" | null>(null);
  const currentHovered = useRef<HoveredElementType | null>(null);
  const currentDragged = useRef<string | null>(null);
  const zIndexUpdated = useRef<boolean>(false);
  
  const [controlPanelPosition, setControlPanelPosition] = useState<Position>({ x:0, y:0 }) 
  const isControlPanelSelected = useRef<boolean>(false);
  const currentSelectedKnob = useRef<Knobs | null>(null);
  
  useCanvasKeybindings({
    selectedTarget: lastSelected,
    setElements,
  });

  const handleDelinkeElement = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    setElements((prev)=>{
       
      if(!lastSelected.current) return prev;
      let nextState: Record<string, ElementAttr>;

      let currentElement = findInTree(prev, lastSelected.current!);
      const updatedElements = removeElementFromTree({ elements: prev, targetId:lastSelected.current! });

      if(!updatedElements || !currentElement)return prev;
      const absoluteCanvasPosition = getCanvasRelativePosition(elements, currentElement);

      currentElement = {
        ...currentElement,
        position: absoluteCanvasPosition,
        currentStateInTree:{
          isChildElement:false,
          parentElementID:null
        }
      }

      nextState = { ...updatedElements, [lastSelected.current!]: currentElement  };
      return nextState;    
    });
  }


 function getCanvasRelativePosition(
  elements: Record<string, ElementAttr>,
  currentElement:ElementAttr | null

): { x: number; y: number } {
  if(!currentElement)return { x:0, y:0 }

  const currentX = currentElement.position?.x ?? 0;
  const currentY = currentElement.position?.y ?? 0;

  const isChild = currentElement.currentStateInTree?.isChildElement;
  const parentId = currentElement.currentStateInTree?.parentElementID;

  if (isChild && parentId) {
    const parentElement = findInTree(elements, parentId) ?? null;
    const parentOffset = getCanvasRelativePosition(elements, parentElement);
    return {
      x: parentXToCanvas(currentX, parentOffset.x),
      y: parentYToCanvas(currentY, parentOffset.y),
    };
  }

  return { x: currentX, y: currentY };
}

function parentXToCanvas(childX: number, parentX: number): number {
  return parentX + childX;
}

function parentYToCanvas(childY: number, parentY: number): number {
  return parentY + childY;
}
  
  
  

  return (
    <div
      id="canvas-container"
      onPointerDown={event => handlePointerDownContainer({ event, lastSelected, elements, cursorStyle, setElements, selectedMode, selectedTarget, pointerOffset, activeTool: activeTool, setActiveTool, setElementState, selectedResizeBorder })}
      onPointerMove={event => handlePointerMove({ event, pointerOffset, selectedMode, elements, selectedTarget, setElements, elementState, selectedResizeBorder, currentHovered, setGuide, zIndexUpdated, currentDragged })}
      onPointerUp={event => handlePointerUp({ setGuide, selectedMode, selectedTarget, setElementState, cursorStyle, selectedResizeBorder, setElements, currentHovered, elements, currentDragged })}
      className={`bg-slate-100 w-full h-screen relative overflow-hidden select-none  ${cursorStyle.current !== null ? cursorStyle.current : activeTool != Modes.GRAB ? "cursor-crosshair" : ""}`}
    >

      <div className="bg-slate-300/35 pointer-events-none inset-0 absolute" />
      <AlignmentGuidesOverlay guides={guide} />
      {
        lastSelected.current && 
        <ControlPanel
          contolPanelPosition={controlPanelPosition}
          onPointerDown={(event)=> HandleControlPanelPointerDown({event, isControlPanelSelected, pointerOffset, setControlPanelPosition, currentSelectedKnob,elements, lastSelected, setElements })}
          onPointerUp={(event)=> HandleControlPanelPointerUp({event, isControlPanelSelected,pointerOffset, setControlPanelPosition, currentSelectedKnob, elements, lastSelected})}
          onSetControlPanelPosition={(event)=> HandlePointerMove({event,isControlPanelSelected, pointerOffset, setControlPanelPosition, currentSelectedKnob, lastSelected, elements, setElements})}
          currentElement={lastSelected.current}
          elements={elements}
          onUpdateStyle={setElements}
          onDeleteElement={() => setElements((prev) => removeElementFromTree({ elements: prev, targetId:lastSelected.current! }))}
          onDelinkElement={handleDelinkeElement} />
      }


      <Toolbar
        activeTool={activeTool}
        onSelectTool={(tool) => setActiveTool(tool)}
      />

      {Object.entries(elements).map(([id, element]) => (
        <CanvasElement
          selectedTarget={selectedTarget}
          key={id}
          guide={guide}
          setGuide={setGuide}
          id={id}
          elements={elements}
          selectedElement={selectedTarget.current!}
          element={element}
          setElements={setElements}
        />
      ))}

    </div>
  );
}
