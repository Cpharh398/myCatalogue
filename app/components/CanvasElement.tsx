import { CurrentState, type AlignmentGuide, type ElementAttr } from "~/util/types";
import { ToolBox } from "./hoveringToolbox";
import type React from "react";
import { useRef, type JSX } from "react";
import { updateElementStyle } from "~/features/util";
import { DropVisualizer } from "./dropVisualizer";
import { ResizingHandles } from "./resizingHandles";
import { HoveredElementHighlight } from "./hoverUI";

type ElementProps = {
  id: string;
  selectedElement: string;
  element: ElementAttr;
  elements: Record<string, ElementAttr>
  setElements: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
  selectedTarget: React.RefObject<string | null>;
  guide: AlignmentGuide[]
  setGuide: React.Dispatch<React.SetStateAction<AlignmentGuide[]>>
  isPreview?: boolean;
  onNavigate?: (target: string) => void;
  selectedIds?: string[];
  onSelect?: (id: string, additive: boolean) => void;
};

export function CanvasElement({ id, element, elements, guide, setGuide, setElements, selectedElement, selectedTarget, isPreview = false, onNavigate, selectedIds = [], onSelect }: ElementProps) {
  const groupDrag = useRef<{ x: number; y: number; positions: Record<string, {x:number;y:number}> } | null>(null);
  const selectionOnlyPointer = useRef(false);
  const isMultiSelected = selectedIds.includes(id);

const getBackgroundStyle = () => {
  if (element.useGradient) {
    // 1. Format angle properly with "deg" (remove "to")
    const angle = typeof element.gradientAngle === "number" 
      ? `${element.gradientAngle}deg` 
      : `${element.gradientAngle || "90"}deg`;
      
    const startPos = element.gradientStartPosition ?? 0;
    const endPos = element.gradientEndPosition ?? 100;

    return `linear-gradient(${angle}, ${element.gradientStart || "#ffffff"} ${startPos}%, ${element.gradientEnd || "#000000"} ${endPos}%)`;
  }

  return element.backgroundColor || "transparent";
};

  const containerStyle: React.CSSProperties = {
    display: element.hidden ? "none" : undefined,
    position: "absolute",
    top: `${element.position.y! * 16}px`,
    left: `${element.position.x! * 16}px`,
    width: `${element.size?.width! * 16}px`,
    height: `${element.size?.height! * 16}px`,
    borderTopLeftRadius: `${element.borderRadius.radiusTL}%`,
    borderTopRightRadius: `${element.borderRadius.radiusTR}%`,
    borderBottomLeftRadius: `${element.borderRadius.radiusBL}%`,
    borderBottomRightRadius: `${element.borderRadius.radiusBR}%`,
    borderWidth: `${element.borderWidth}px`,
    borderColor: element.borderColor,
    borderStyle: element.borderStyle,
    background: getBackgroundStyle(),
    zIndex: element.currentState === CurrentState.DRAG ? 9999 : element.zIndex,
    ...element.lgSreenStyle,
  };

  const Tag = (element.elementTag || "div") as keyof JSX.IntrinsicElements;

  return (
    <div
      data-element-id={id}
      id={element.sectionId || undefined}
      style={containerStyle}
      onPointerDown={event => {
        if (isPreview) return;
        if (event.shiftKey || event.metaKey || event.ctrlKey) { event.stopPropagation(); (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); selectionOnlyPointer.current = true; onSelect?.(id, true); return; }
        if (selectedIds.length > 1 && isMultiSelected) {
          event.preventDefault(); event.stopPropagation();
          (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
          groupDrag.current = { x: event.clientX, y: event.clientY, positions: Object.fromEntries(selectedIds.map(selectedId => { const selected = elements[selectedId]; return [selectedId, { x: selected?.position.x || 0, y: selected?.position.y || 0 }]; })) };
        }
      }}
      onPointerMove={event => {
        if (selectionOnlyPointer.current) { event.stopPropagation(); return; }
        if (!groupDrag.current) return;
        event.stopPropagation();
        const dx = (event.clientX - groupDrag.current.x) / 16; const dy = (event.clientY - groupDrag.current.y) / 16;
        const positions = groupDrag.current.positions;
        setElements(previous => { const next = { ...previous }; for (const [selectedId, position] of Object.entries(positions)) if (next[selectedId]) next[selectedId] = { ...next[selectedId], position: { x: position.x + dx, y: position.y + dy } }; return next; });
      }}
      onPointerUp={event => { if (selectionOnlyPointer.current) { event.stopPropagation(); selectionOnlyPointer.current = false; return; } if (groupDrag.current) { event.stopPropagation(); groupDrag.current = null; if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId); } }}
      onPointerCancel={event => { if (selectionOnlyPointer.current) { event.stopPropagation(); selectionOnlyPointer.current = false; } if (groupDrag.current) { event.stopPropagation(); groupDrag.current = null; } }}
      onClick={event => { if (isPreview && element.linkTarget) { event.stopPropagation(); onNavigate?.(element.linkTarget); } else if (!isPreview && !event.shiftKey && !event.metaKey && !event.ctrlKey && !(selectedIds.length > 1 && isMultiSelected)) onSelect?.(id, false); }}
      className={`absolute touch-none transition-transform ${isMultiSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${element.currentState === CurrentState.IDLE ? "cursor-grab active:cursor-grabbing" : ""} flex flex-col justify-between`}
    >

      {
        element.currentState == CurrentState.HOVERED &&
        <div
          style={{
            boxShadow: "0 0 12px rgba(59, 130, 246, 0.4)",
          }}
          className="absolute inset-0 pointer-events-none rounded border-2 border-dashed border-blue-500 bg-blue-500/10 z-50 flex items-center justify-center transition-all duration-150" />
      }

      <ResizingHandles isVisible={element.showToolBox} />
      <CanvasChildren guide={guide} setGuide={setGuide} selectedTarget={selectedTarget} selectedElement={selectedElement} children={element.canvasChildren!} setElements={setElements} />
      <HoveredElementHighlight currentState={element.currentState} />
      <DropVisualizer canvasChildren={element.canvasChildren} />
      <RenderInnerContent Tag={Tag} element={element} id={id} isPreview={isPreview} />
      

    </div>
  );
}




type canvasChildProps = {
  selectedElement: string;
  children: Record<string, ElementAttr>
  setElements: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>> | undefined,
  selectedTarget: React.RefObject<string | null>;
  guide: AlignmentGuide[]
  setGuide: React.Dispatch<React.SetStateAction<AlignmentGuide[]>>
};


export function CanvasChildren({ children, setElements, selectedElement, selectedTarget, guide, setGuide }: canvasChildProps) {

  const elements = children;
  if (children && setElements) {
    return Object.entries(children).map(([id, element]) => (
      <CanvasElement
        key={id}
        id={id}
        guide={guide}
        setGuide={setGuide}
        setElements={setElements}
        elements={elements}
        selectedTarget={selectedTarget}
        selectedElement={selectedElement}
        element={element}
      />
    ));
  };
}




export function RenderInnerContent({ Tag, element, id, isPreview = false }: { Tag: keyof JSX.IntrinsicElements, element: ElementAttr, id: string, isPreview?: boolean }) {

  if (Tag === "div") return;

  // Specialized rendering for non-div tags inside the outer wrapper
  if (Tag === "img") {
    return (
      <img
        src={element.content}
        alt={`Canvas element ${id}`}
        draggable={false}
        className="w-full h-full object-cover pointer-events-none rounded-[inherit]"
      />
    );
  }

  if (Tag === "input") {
    return <input type={element.inputType || "text"} placeholder={element.content} aria-label={element.content} className={`h-full w-full border-0 bg-transparent px-3 outline-none ${isPreview ? "pointer-events-auto" : "pointer-events-none"}`} />;
  }

  if (Tag === "textarea") {
    return <textarea placeholder={element.content} aria-label={element.content} className={`h-full w-full resize-none border-0 bg-transparent p-3 outline-none ${isPreview ? "pointer-events-auto" : "pointer-events-none"}`} />;
  }

  // Default tag rendering h1, h2, p, button
  return (
    <Tag className={`w-full h-full flex items-center justify-center wrap-break-word ${isPreview ? "pointer-events-auto" : "pointer-events-none"}`}>
      {element.content}
    </Tag>
  );
};
