import type React from "react";
import type { CSSProperties } from "react";
import type { JSX } from "react/jsx-runtime";


export type TextSubOption = "heading" | "subheading" | "paragraph";
export type PrebuiltToolType = "accordion" | "productCard" | "form" | "pricingTable" | "hero" | "navbar";


export type Position = {
  x?: number;
  y?: number;
};

export type CurrentStateInTree = {
  isChildElement: boolean
  parentElementID: string | null,
}

export type BorderRadius = {
  radiusTL: number;
  radiusTR: number;
  radiusBL: number;
  radiusBR: number;
};

export type Size = {
  width: number;
  height: number;
};

export type ResponsiveDevice = "tablet" | "mobile";
export type ResponsiveElementStyle = {
  position?: Position;
  size?: Size;
  lgSreenStyle?: CSSProperties;
  backgroundColor?: string;
  borderRadius?: BorderRadius;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  useGradient?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  hidden?: boolean;
};


export type ElementAttr = {

  elementTag: keyof JSX.IntrinsicElements;
  content: string;
  position: Position;
  borderRadius: BorderRadius;
  borderColor: string;
  borderWidth: number;
  borderStyle: string;
  backgroundColor: string;
  useGradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  showToolBox?: boolean;
  size?: Size;
  currentState?: CurrentState
  transformOrigin: string,
  zIndex: number,
  canvasChildren?: Record<string, ElementAttr>,
  isChildElement?: boolean,
  currentStateInTree?: CurrentStateInTree,
  lgSreenStyle?: CSSProperties,
  gradientStartPosition?: number,
  gradientEndPosition?: number,
  linkTarget?: string,
  sectionId?: string,
  sectionName?: string,
  responsiveStyles?: Partial<Record<ResponsiveDevice, ResponsiveElementStyle>>,
  hidden?: boolean,
  inputType?: "text" | "email" | "tel";
};


export enum CurrentState {
  IDLE,
  DRAG,
  DROPPED,
  RESIZING,
  HOVERED,
}

export enum Modes {
  GRAB,
  CONTAINER,
  VIDEO,
  AUDIO,
  PICTURE,
  TEXT,
  AI,
  BUTTON,
  LIBRARY
}


export type ActiveToolType={
   tool: Modes,
  extraData?: { textType?: TextSubOption; aiPrompt?: string; componentType?: PrebuiltToolType }
}

export type pageEditProps = {

  event: React.PointerEvent,
  selectedTarget: React.RefObject<string | null>,
  pointerOffset: React.RefObject<Position>,
  setElements: (value: React.SetStateAction<Record<string, ElementAttr>>) => void,
  selectedMode: React.RefObject<Modes>,
  activeTool: ActiveToolType
  setActiveTool:  React.Dispatch<React.SetStateAction<ActiveToolType>>
  elementState: CurrentState
  setElementState: React.Dispatch<React.SetStateAction<CurrentState>>
  selectedResizeBorder: React.RefObject<string | null>
  cursorStyle: React.RefObject<string | null>
  elements: Record<string, ElementAttr>
  zIndex: number,
  currentHovered: React.RefObject<HoveredElementType | null>,
  zIndexUpdated: React.RefObject<boolean>,
  currentDragged: React.RefObject<string | null>
  lastSelected?: React.RefObject<string | null>
  setGuide: React.Dispatch<React.SetStateAction<AlignmentGuide[]>>
}

export type HoveredElementType = {
  elementID: string
  relativePosition: Position
}


export type initResizingProps = {
  target: HTMLElement,
  selectedTarget: React.RefObject<string | null> | undefined,
  props: Partial<pageEditProps>;
  resizePoint: string;
  elementId: string;
}

export interface AlignmentGuide {
  type: "x" | "y";
  position: number;   // Coordinate along the perpendicular axis (in rem)
  start: number;      // Where the line segment starts (in rem)
  length: number;     // How long the line segment extends (in rem)
}

// export enum Knobs {
//   xPosittion = "xPosittion",
//   yPosition = "yPosition",
//   width = "width",
//   height = "height",
//   rotation = "rotation",
//   opacity = "opacity",
//   radiusTL = "radiusTL",
//   radiusTR = "radiusTR",
//   radiusBL = "radiusBL",
//   radiusBR = "radiusBR",
//   radiusAll = "radiusAll",
//   gradientStartPosition = "gradientStartPosition",
//   gradientEndPosition = "gradientEndPosition",
//   gradientAngle = "gradientAngle"
// }
