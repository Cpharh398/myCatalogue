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
  
  const getBackgroundStyle = () => {

    if (element.useGradient) {
      return `linear-gradient(${element.gradientAngle}deg, ${element.gradientStart}, ${element.gradientEnd})`;
    }
    return element.backgroundColor;
  };

  const containerStyle: React.CSSProperties = {
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
  };

  const Tag = (element.elementTag || "div") as keyof JSX.IntrinsicElements;
  
  return (
    <div
      data-element-id={id}
      style={containerStyle}
      className = {`absolute touch-none transition-transform shadow-md  ${ element.currentState === CurrentState.IDLE ? "cursor-grab active:cursor-grabbing": "" } flex flex-col justify-between`}
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
      <CanvasChildren  guide={guide} setGuide={setGuide} selectedTarget={selectedTarget} selectedElement={selectedElement} children={element.canvasChildren!} setElements={setElements}/>
      <HoveredElementHighlight currentState={element.currentState} />
      <DropVisualizer  canvasChildren={element.canvasChildren}/>
      
      <RenderInnerContent Tag={Tag} element={element} id={id} />
      {/* <ToolBox
        id={id}
        isVisible={element.showToolBox ?? false}
        element={element}
        onUpdateStyle={onUpdateStyle}
      /> */}
    
    </div>
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





export function RenderInnerContent({Tag, element,id}:{Tag: keyof JSX.IntrinsicElements, element: ElementAttr, id:string}){

    if(Tag === "div")return;

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

    // Default tag rendering h1, h2, p, button
    return (
      <Tag className="w-full h-full flex items-center justify-center wrap-break-word pointer-events-none">
        {element.content}
      </Tag>
    );
  };