import type { JSX } from "react/jsx-runtime";

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
  currentStateInTree?: CurrentStateInTree
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
  AI
}


export type pageEditProps = {

  event: React.PointerEvent,
  selectedTarget: React.RefObject<string | null>,
  pointerOffset: React.RefObject<Position>,
  setElements: (value: React.SetStateAction<Record<string, ElementAttr>>) => void,
  selectedMode: React.RefObject<Modes>,
  activeTool: Modes
  setActiveTool: React.Dispatch<React.SetStateAction<Modes>>
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

