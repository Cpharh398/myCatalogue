import type { ElementAttr } from "~/util/types";
import { ToolBox } from "./hoveringToolbox";
import type React from "react";

type ElementProps = {
  id: string;
  element: ElementAttr;
  onUpdateStyle: (
    updater: (prev: ElementAttr) => Partial<ElementAttr>
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
      style={
          {
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
          width: `${element.size?.width}rem` ,
          height: `${element.size?.height}rem`,
          transformOrigin:"left center"
        }
      }

      className={`absolute transition-transform shadow-md cursor-grab active:cursor-grabbing flex flex-col justify-between`}
    >

      {
        ...ResizingHandles()
      }

      <ToolBox
        isVisible={element.showToolBox ?? false}
        element={element}
        onUpdateStyle={onUpdateStyle}
      />
    </div>
  );
}

export function ResizingHandles() {
  
  const handleStyle =
    "bg-white border-2 border-blue-500 rounded-full absolute z-20 shadow transition-transform hover:scale-125";


  const resizePoints:{ point:string, position:string  }[] = 
  [ 
    { point:"tl", position: "-top-2 -left-2 w-4 h-4 cursor-nwse-resize" }, 
    { point:"tr", position:"-top-2 -right-2 w-4 h-4  cursor-nesw-resize" }, 
    {  point:"bl", position:"-bottom-2 -left-2 w-4 h-4 cursor-nesw-resize" }, 
    { point:"br", position:"-bottom-2 -right-2 w-4 h-4 cursor-nwse-resize" },

    { point:"top", position:"-top-2 h-4 w-[50%] translate-x-1/2 cursor-n-resize" },  
    { point:"bottom", position:"-bottom-2  h-4 w-[50%] translate-x-1/2 cursor-s-resize " },  
    { point:"left", position:"-left-2  w-4 h-[50%] translate-y-1/2 cursor-ew-resize" },  
    { point:"right", position:"-right-2  w-4 h-[50%] translate-y-1/2 cursor-ew-resize " },  
  ]

  return (
    [
      resizePoints.map(point =>  <div
        key={point.point}
        data-resizepoint={point.point}
        className={` ${handleStyle} absolute  ${point.position} scale-125 ring-2 ring-blue-300`}
      />  )
    ]

  );


}
