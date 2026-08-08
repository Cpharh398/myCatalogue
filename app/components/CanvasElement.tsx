import type { ElementState } from "~/util/types";
import { ToolBox } from "./hoveringToolbox";

type ElementProps = {
  id: string;
  element: ElementState;
  onUpdateStyle: (
    updater: (prev: ElementState) => Partial<ElementState>
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
      style={{
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
      }}
      className="absolute w-44 h-44 shadow-md cursor-grab active:cursor-grabbing flex flex-col justify-between"
    >
      <ToolBox
        isVisible={element.showToolBox ?? false}
        element={element}
        onUpdateStyle={onUpdateStyle}
      />
    </div>
  );
}
