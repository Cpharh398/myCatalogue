import { useEffect, useRef, useState } from "react";
import { Toolbar } from "~/components/appToolBar";
import { CanvasElement } from "~/components/CanvasElement";
import { ControlPanel } from "~/components/controlUnit";
import { AlignmentGuidesOverlay } from "~/components/guidLines";
import { HandleControlPanelPointerDown, HandleControlPanelPointerUp, HandleSetControlPanelPosition } from "~/features/controlPanel/service";
import { handlePointerMove, handlePointerDownContainer, handlePointerUp, removeElement, } from "~/features/pageEditing/service"
import { getContainerRelativePosition, updateElementStyle } from "~/features/util";
import { useCanvasKeybindings } from "~/hooks/useCanvasKeyBindings";
import { type AlignmentGuide, type ElementAttr, type HoveredElementType, type Position, CurrentState, Modes } from "~/util/types"



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


  useCanvasKeybindings({
    selectedTarget: lastSelected,
    setElements,
  });

  

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
          onPointerDown={(event)=> HandleControlPanelPointerDown({event, isControlPanelSelected, pointerOffset, setControlPanelPosition})}
          onPointerUp={(event)=> HandleControlPanelPointerUp({event, isControlPanelSelected,pointerOffset, setControlPanelPosition})}
          onSetControlPanelPosition={(event)=>HandleSetControlPanelPosition({event,isControlPanelSelected, pointerOffset, setControlPanelPosition})}
          currentElement={lastSelected.current}
          elements={elements}
          onUpdateStyle={(updater) => updateElementStyle(lastSelected.current!, updater, setElements)}
          onDeleteElement={(e) => { }}
          onDelinkElement={(e) => { }} />
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
          onUpdateStyle={(updater) => updateElementStyle(id, updater, setElements)}
          setElements={setElements}
        />
      ))}

    </div>
  );
}
