import { CurrentState, type AlignmentGuide, type ElementAttr } from "~/util/types";
import { ToolBox } from "./hoveringToolbox";
import type React from "react";
import { removeElement} from "~/features/pageEditing";
import { useEffect, useRef, useState } from "react";
import { updateElementStyle } from "~/features/util";
import { X } from "lucide-react";
import { useCanvasKeybindings } from "~/hooks/useCanvasKeyBindings";
import { DropVisualizer } from "./dropVisualizer";
import { AlignmentGuidesOverlay } from "./guidLines";

type ElementProps = {
  id: string;
  selectedElement: string;
  element: ElementAttr;
  elements:Record<string, ElementAttr>
  onUpdateStyle: (
    updater: (prev: ElementAttr) => Partial<ElementAttr>
  ) => void;
  setElements: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
  selectedTarget: React.RefObject<string | null>;
  guide:AlignmentGuide[]
   setGuide: React.Dispatch<React.SetStateAction<AlignmentGuide[]>>
};

export function CanvasElement({ id, element, guide, setGuide, onUpdateStyle, setElements, selectedElement, selectedTarget }: ElementProps) {
  const targetID = useRef(id);

  const getBackgroundStyle = () => {

    if (element.useGradient) {
      return `linear-gradient(${element.gradientAngle}deg, ${element.gradientStart}, ${element.gradientEnd})`;
    }
    return element.backgroundColor;
  };
  
  return (
    <div
      data-element-id={id}
      style={
          {
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
          zIndex:element.currentState === CurrentState.DRAG ? 9999 : element.zIndex,
        }
      }

      className = {`absolute touch-none transition-transform shadow-md  ${ element.currentState === CurrentState.IDLE ? "cursor-grab active:cursor-grabbing": "" } flex flex-col justify-between`}
    >

      {
        <ResizingHandles isVisible={element.showToolBox} />
      }

      {
        element.currentState == CurrentState.HOVERED && 
        <div
        style={{
        boxShadow: "0 0 12px rgba(59, 130, 246, 0.4)",
      }} 
         className="absolute inset-0 pointer-events-none rounded border-2 border-dashed border-blue-500 bg-blue-500/10 z-50 flex items-center justify-center transition-all duration-150" />
      }

      <CanvasChildren  guide={guide} setGuide={setGuide} selectedTarget={selectedTarget} selectedElement={selectedElement} children={element.canvasChildren!} setElements={setElements}/>
      <HoveredElementHighlight currentState={element.currentState} />
      <DropVisualizer  canvasChildren={element.canvasChildren}/>

      <ToolBox
        id={id}
        isVisible={element.showToolBox ?? false}
        element={element}
        onUpdateStyle={onUpdateStyle}
      />
    
    </div>
  );
}

export function ResizingHandles({ isVisible }:{ isVisible:boolean | undefined } ) {

  const cornerHandleStyle =
    "w-3 h-3 bg-white border-[2px] border-blue-600 rounded-full shadow-sm transition-transform hover:scale-125 z-30";

  const edgeHandleStyle =
    "bg-white border-[1.5px] border-blue-600 rounded-full shadow-sm transition-transform hover:scale-125 z-30";

  const resizePoints = [

    { point: "tl", style: `${cornerHandleStyle} -top-[1.1rem] -left-[1.1rem] cursor-nwse-resize` },
    { point: "tr", style: `${cornerHandleStyle} -top-[1.1rem] -right-[1.1rem] cursor-nesw-resize` },
    { point: "bl", style: `${cornerHandleStyle} -bottom-[1.1rem] -left-[1.1rem] cursor-nesw-resize` },
    { point: "br", style: `${cornerHandleStyle} -bottom-[1.1rem] -right-[1.1rem] cursor-nwse-resize` },

    {
      point: "top",
      style: `${edgeHandleStyle} -top-[1.1rem] left-1/2 -translate-x-1/2 w-5 h-2 cursor-ns-resize`,
    },
    {
      point: "bottom",
      style: `${edgeHandleStyle} -bottom-[1.1rem] left-1/2 -translate-x-1/2 w-5 h-2 cursor-ns-resize`,
    },
    {
      point: "left",
      style: `${edgeHandleStyle} -left-[1.1rem] top-1/2 -translate-y-1/2 w-2 h-5 cursor-ew-resize`,
    },
    {
      point: "right",
      style: `${edgeHandleStyle} -right-[1.1rem] top-1/2 -translate-y-1/2 w-2 h-5 cursor-ew-resize`,
    },
  ];

  if(!isVisible)return;

  return (
    <>
      <div className={`absolute -inset-3.5  ${ isVisible ? "pointer-events-auto": "pointer-events-none" }  border-[1.5px] border-blue-600 pointer-events-none z-10`} />

      {resizePoints.map((point) => (
        <div
          key={point.point}
          data-resizepoint={point.point}
          className={`absolute ${point.style}`}
        />
      ))}
    </>
  );
}






type canvasChildProps = {
  selectedElement: string;
  children:Record<string, ElementAttr>
  setElements: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>> | undefined,
  selectedTarget: React.RefObject<string | null>;
    guide:AlignmentGuide[]
   setGuide: React.Dispatch<React.SetStateAction<AlignmentGuide[]>>
};

  
export function CanvasChildren( { children, setElements, selectedElement, selectedTarget, guide, setGuide }: canvasChildProps){

    const elements = children;
    if(children && setElements){
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
              onUpdateStyle = { (updater) => updateElementStyle(id, updater, setElements!) }
            />
        ));
    };
} 



interface HoveredOverlayProps {
  currentState?: CurrentState;
  label?: string;
}

export const HoveredElementHighlight: React.FC<HoveredOverlayProps> = ({
  currentState,
  label = "Drop here",
}) => {

  if (currentState !== CurrentState.HOVERED) return null;

  return (
    <div
      className = "absolute inset-0 pointer-events-none rounded border-2 border-dashed border-blue-500 bg-blue-500/10 z-50 flex items-center justify-center transition-all duration-150"
      style={{
        boxShadow: "0 0 12px rgba(59, 130, 246, 0.4)",
      }}
    >
      <span className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};


