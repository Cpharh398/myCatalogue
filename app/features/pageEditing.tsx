import { CurrentState, type ElementAttr, type pageEditProps, type Position } from "~/util/types";
import { Modes } from "~/util/types";

const resizeCanvasElement = ({ event, elementState, pointerOffset, setElements, selectedResizeBorder, selectedTarget }: Partial<pageEditProps>) => {
    
    if (elementState === CurrentState.RESIZING) {
        
        const cornerResizePoints = ["br", "tr", "bl", "tl"]
        
        if (cornerResizePoints.includes(selectedResizeBorder!.current!)) {
            HandleCornerResize({ pointerOffset, event, setElements, selectedResizeBorder , selectedTarget});
        } else {
            HandleEdgeResize({ pointerOffset, event, setElements, selectedResizeBorder })
        }
    }
};


export const HandleCornerResize = (props: Partial<pageEditProps>) => {
    if (!props.event || !props.pointerOffset?.current || !props.setElements) return;

  const selectedElementID = props.selectedTarget?.current as string;
  const corner = props.selectedResizeBorder?.current;

  if (!selectedElementID || !corner) return;

  const prevX = props.pointerOffset.current.x;
  const prevY = props.pointerOffset.current.y;

  const rawDeltaX = props.event.clientX - prevX!;
  const rawDeltaY = props.event.clientY - prevY!;

  props.pointerOffset.current = { x: props.event.clientX, y: props.event.clientY };

  const pixelSize = 16; 
  const sensitivity = .6; 

  props.setElements((prev) => {
    const currentEl = prev[selectedElementID];
    if (!currentEl) return prev;

    const currentWidth = currentEl.size?.width ?? 1;
    const currentHeight = currentEl.size?.height ?? 1;
    const currentX = currentEl.position?.x ?? 0;
    const currentY = currentEl.position?.y ?? 0;

    const aspectRatio = currentWidth / currentHeight;

    const xDir = corner === "tr" || corner === "br" ? 1 : -1;
    const yDir = corner === "bl" || corner === "br" ? 1 : -1;

    const gridDeltaX = ((rawDeltaX * xDir) / pixelSize) * sensitivity;
    const gridDeltaY = ((rawDeltaY * yDir) / pixelSize) * sensitivity;

    const combinedDelta = (gridDeltaX + gridDeltaY) / 2;

    const widthDelta = combinedDelta;
    const heightDelta = combinedDelta / aspectRatio;

    let newWidth = Math.max(1, currentWidth + widthDelta);
    let newHeight = Math.max(1, currentHeight + heightDelta);

    const actualWidthChange = newWidth - currentWidth;
    const actualHeightChange = newHeight - currentHeight;

    let newX = currentX;
    let newY = currentY;

    if (corner === "tl" || corner === "bl") {
      newX = currentX - actualWidthChange;
    }
    if (corner === "tl" || corner === "tr") {
      newY = currentY - actualHeightChange;
    }

    return {
      ...prev,
      [selectedElementID]: {
        ...currentEl,
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight },
      },
    };
  });
};

export const HandleEdgeResize = (props: Partial<pageEditProps>) => {
  
    if (!props.event || !props.pointerOffset?.current || !props.setElements) return;
    
    const target = props.event.target as HTMLElement;
    const selectedElementID = target?.parentElement?.dataset.elementId as string;
    const edge = props.selectedResizeBorder?.current;
    
    if (!selectedElementID || !edge) return;
    
    const prevX = props.pointerOffset.current.x!;
    const prevY = props.pointerOffset.current.y!;

    const rawDeltaX = props.event.clientX - prevX;
    const rawDeltaY = props.event.clientY - prevY;
    
    props.pointerOffset.current = { x: props.event.clientX, y: props.event.clientY };
    
    const pixelSize = 16;
    
    props.setElements((prev) => {
        const currentEl = prev[selectedElementID];
        
        if (!currentEl) return prev;


    const currentWidth = currentEl.size?.width ?? 1;
    const currentHeight = currentEl.size?.height ?? 1;
    const currentX = currentEl.position?.x ?? 0;
    const currentY = currentEl.position?.y ?? 0;

    let newWidth = currentWidth;
    let newHeight = currentHeight;
    let newX = currentX;
    let newY = currentY;

    if (edge === "right") {
      const deltaWidth = rawDeltaX / pixelSize;
      newWidth = Math.max(1, currentWidth + deltaWidth);
    } else if (edge === "left") {
      const deltaWidth = -rawDeltaX / pixelSize;
      newWidth = Math.max(1, currentWidth + deltaWidth);
      const actualWidthChange = newWidth - currentWidth;
      newX = currentX - actualWidthChange;
    }

    if (edge === "bottom") {
      const deltaHeight = rawDeltaY / pixelSize;
      newHeight = Math.max(1, currentHeight + deltaHeight);
    } else if (edge === "top") {
      const deltaHeight = -rawDeltaY / pixelSize;
      newHeight = Math.max(1, currentHeight + deltaHeight);
      const actualHeightChange = newHeight - currentHeight;
      newY = currentY - actualHeightChange;
    }

    return {
      ...prev,
      [selectedElementID]: {
        ...currentEl,
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight },
      },
    };
  });
};


const getRezingCursorStyle = (resizePoint:string)=>{
    switch(resizePoint){

        case "top":
        case "bottom": 
            return "cursor-ns-resize"

        case "right":
        case "left": 
            return "cursor-ew-resize"

        case "tl":
        case "br": 
            return "cursor-nwse-resize"

        case "tr":
        case "bl": 
            return "cursor-nesw-resize"

        default: return null;
    };

}

const resizeSectionSelected = ({ props, resizePoint, elementId  }: { props: Partial<pageEditProps>, resizePoint: string, elementId:string }) => {
  
    props.event!.stopPropagation();
    props.pointerOffset!.current = { x: props.event?.clientX, y: props.event!.clientY }
    props.selectedResizeBorder!.current = resizePoint;
    props.cursorStyle!.current = getRezingCursorStyle(resizePoint);
    // const target = props.event?.target as HTMLElement;

    props.setElementState!(CurrentState.RESIZING);
  
    props.setElements!(prev =>{

        return {
            ...prev,
            [elementId]: {
            ...prev[elementId],
            currentState: CurrentState.RESIZING,
        },

        }
    });
};



export const updateElementsPosition = ({ event, selectedTarget, pointerOffset, setElements, elementState }: Partial<pageEditProps>) => {

    if (!selectedTarget!.current || elementState === CurrentState.RESIZING) return;
    const boxId = selectedTarget!.current;

    const container = document.getElementById("canvas-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const x = (event!.clientX - rect.left - (pointerOffset!.current.x ?? 0)) / 16;
    const y = (event!.clientY - rect.top - (pointerOffset!.current.y ?? 0)) / 16;

    setElements!((prev) => ({
        ...prev,
        [boxId]: {
            ...prev[boxId],
            position: { x, y },
            showToolBox: true,
        },
    }));
};


export const handlePointerMove = ({ selectedTarget, selectedMode, event, pointerOffset, setElements, elementState, selectedResizeBorder }: Partial<pageEditProps>) => {

    if (!selectedTarget!.current) return;

    if (selectedResizeBorder!.current !== null) {
        resizeCanvasElement({ event, elementState, pointerOffset, setElements, selectedResizeBorder, selectedTarget })
    } else {
        if (selectedMode!.current === Modes.GRAB) {
            updateElementsPosition({ event, pointerOffset, selectedTarget, setElements, elementState, });
        }
    }
};


export const createNewBox = ({ event, setElements, activeTool, setActiveTool, selectedTarget, pointerOffset,setElementState,selectedResizeBorder,cursorStyle   }: Partial<pageEditProps>) => {

    if (activeTool === Modes.GRAB) {

        setElements!((prev) => {
        const nextState: Record<string, ElementAttr> = {};

        Object.keys(prev).forEach((id) => {
            nextState[id] = {
                ...prev[id],
                showToolBox: false,
            };
        });
        return nextState;
    });
        return;
    };

    
    const boxID = crypto.randomUUID();
    const container = event!.currentTarget.getBoundingClientRect();
    const x = (event!.clientX - container.left - 2) / 16;
    const y = (event!.clientY - container.top - 2) /16;
    const target = event?.target as HTMLElement;
    target.setPointerCapture(event!.pointerId);
    
    setElements!((prev) => ({
        ...prev,
        ...Object.keys(prev).reduce((acc, key) => {
            acc[key] = { ...prev[key], showToolBox: false };
            return acc;
        }, {} as Record<string, ElementAttr>),
        [boxID]: {
            showToolBox: true,
            position: { x, y },
            borderRadius: { radiusBL: 0, radiusBR: 0, radiusTL: 0, radiusTR: 0 },
            borderColor: "#3b82f6",
            borderWidth: 0,
            borderStyle: "solid",
            backgroundColor: "#f59e0b",
            useGradient: false,
            gradientStart: "#ec4899",
            gradientEnd: "#8b5cf6",
            gradientAngle: 135,
            size: { width: 1, height: 1 },
            currentState: CurrentState.RESIZING,
            transformOrigin:"center center",
            verticalAnchor:"top",
            horizontalAnchor:"left"
        },
    }));
    
    initializeResizing({ target, selectedTarget, props:{ event, pointerOffset, setElementState, selectedResizeBorder, cursorStyle, setElements }, resizePoint:"br", elementId:boxID } );
    setActiveTool!(Modes.GRAB);
};


export const removeElement = ( props: Partial<pageEditProps> ) =>{

    props.event?.preventDefault();
    const target = props.event?.target as HTMLElement;
    const parentElement = target.closest("[data-element-id]") as HTMLElement;
    const elementID = parentElement?.dataset.elementId;

    const updatedElements = Object.fromEntries(
        Object.entries(props.elements!).filter(([key]) => key !== elementID)
      );    
    props.setElements!(prev => updatedElements);
  }

type initResizingProps = {
    target: HTMLElement, 
    selectedTarget: React.RefObject<string | null> | undefined,
    props: Partial<pageEditProps>;
    resizePoint: string;
    elementId: string;

}


export const initializeResizing = ({ target, selectedTarget, props:{ event, pointerOffset, setElementState, selectedResizeBorder, cursorStyle, setElements } , resizePoint, elementId  }: initResizingProps )=>{
    
    updateSelectedTarget({ target, selectedTarget, elementID:elementId  });
    resizeSectionSelected({ resizePoint: resizePoint, elementId:elementId,  props: { event, pointerOffset, setElementState, selectedResizeBorder, cursorStyle, setElements } });

}


export const handlePointerDownContainer = ({ event,  setElements, cursorStyle, selectedMode, selectedTarget, pointerOffset, activeTool, setActiveTool, setElementState, selectedResizeBorder }: Partial<pageEditProps>) => {

    const target = event!.target as HTMLElement;
    const elementNode = target.closest("[data-element-id]");
    const boxId = elementNode?.getAttribute("data-element-id")!;
    const resizePoint = target.dataset.resizepoint ?? null;
    target.setPointerCapture(event!.pointerId);

    if (resizePoint) {
        initializeResizing({ target, selectedTarget, props:{ event, pointerOffset, setElementState, selectedResizeBorder, cursorStyle, setElements }, resizePoint, elementId:boxId } );
        return;
    }

    if (target.id === "canvas-container") {
        createNewBox({ event, setElements, activeTool, setActiveTool, selectedTarget, pointerOffset, setElementState, selectedResizeBorder, cursorStyle   });
        return;
    }

    updateSelectedTarget({ target, selectedTarget });
    selectedMode!.current = Modes.GRAB;

    const rect = elementNode?.getBoundingClientRect();
    if (!rect) return;
    pointerOffset!.current = {
        x: event!.clientX - rect.left,
        y: event!.clientY - rect.top,
    };

    setElements!((prev) => {
        const nextState: Record<string, ElementAttr> = {};

        Object.keys(prev).forEach((id) => {
            nextState[id] = {
                ...prev[id],
                showToolBox: id === boxId,
            };
        });
        return nextState;
    });
};

export function updateSelectedTarget({ target, selectedTarget, elementID }:
    {
        target: HTMLElement,
        elementID?: string
        selectedTarget: React.RefObject<string | null> | undefined,
    }) {

        if(elementID){
            selectedTarget!.current = elementID;
            return;
        }
        
        const elementNode = target.closest("[data-element-id]");
        if (!elementNode) return;
        
        const boxId = elementNode.getAttribute("data-element-id")!;
        selectedTarget!.current = boxId;
}


export const handlePointerUp = ({ selectedMode, selectedTarget, cursorStyle, setElementState, setElements , selectedResizeBorder, event }: Partial<pageEditProps>) => {

    if (event?.currentTarget.hasPointerCapture(event?.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
    }
    cursorStyle!.current = null;
    selectedMode!.current = Modes.GRAB;
    selectedTarget!.current = null;
    selectedResizeBorder!.current = null;
    setElementState!(_ => CurrentState.DRAG);

    setElements!((prev) => {
        const nextState: Record<string, ElementAttr> = {};

        Object.keys(prev).forEach((id) => {
            nextState[id] = {
                ...prev[id],
                currentState: CurrentState.DRAG
            };
        });
        return nextState;
    });  
};

export const updateElementStyle = (id: string, updater: (prev: ElementAttr) => Partial<ElementAttr>, setElements: (value: React.SetStateAction<Record<string, ElementAttr>>) => void) => {

    setElements!((prev) => ({
        ...prev,
        [id]: {
            ...prev[id],
            ...updater(prev[id]),
        },
    }));

};