import { CurrentState, type ElementAttr, type Position } from "~/util/types";
import { Modes } from "~/util/types";

type pageEditProps = {
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
}


const resizeCanvasElement = ({ event, elementState, pointerOffset, setElements, selectedResizeBorder }: Partial<pageEditProps>) => {


    if (elementState === CurrentState.RESIZING) {

        const cornerResizePoints = ["br", "tr", "bl", "tl"]

        if (cornerResizePoints.includes(selectedResizeBorder!.current!)) {
            HandleCornerResize({ pointerOffset, event, setElements, selectedResizeBorder });
        } else {
            HandleEdgeResize({ pointerOffset, event, setElements, selectedResizeBorder })
        }
    }
};

export const HandleCornerResize = (props: Partial<pageEditProps>) => {
  if (!props.event || !props.pointerOffset?.current || !props.setElements) return;

  const target = props.event.target as HTMLElement;
  const selectedElementID = target?.parentElement?.dataset.elementId as string;
  const corner = props.selectedResizeBorder?.current; 

  if (!selectedElementID || !corner) return;

  const prevX = props.pointerOffset.current.x!;
  const prevY = props.pointerOffset.current.y!;

  const deltaX = props.event.clientX - prevX;
  const deltaY = props.event.clientY - prevY;


  const pixelSize = 16;

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

    const gridDeltaX = (deltaX * xDir) / pixelSize;
    const gridDeltaY = (deltaY * yDir) / pixelSize;

    let widthDelta = 0;
    let heightDelta = 0;

    if (Math.abs(gridDeltaX) >= Math.abs(gridDeltaY)) {
      widthDelta = gridDeltaX;
      heightDelta = gridDeltaX / aspectRatio;
    } else {
      heightDelta = gridDeltaY;
      widthDelta = gridDeltaY * aspectRatio;
    }

    let newWidth = Math.max(1, currentWidth + widthDelta);
    let newHeight = Math.max(1, currentHeight + heightDelta);

    if (newWidth / newHeight !== aspectRatio) {
      if (newWidth < newHeight * aspectRatio) {
        newWidth = newHeight * aspectRatio;
      } else {
        newHeight = newWidth / aspectRatio;
      }
    }

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
  console.log(edge);

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
      newWidth = currentWidth + deltaWidth
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


const resizeSectionSelected = ({ props, resizePoint }: { props: Partial<pageEditProps>, resizePoint: string }) => {
    props.event!.stopPropagation();
    props.pointerOffset!.current = { x: props.event?.clientX, y: props.event!.clientY }
    props.selectedResizeBorder!.current = resizePoint;
    props.setElementState!(CurrentState.RESIZING);
};



export const updateElementsPosition = ({ event, selectedTarget, pointerOffset, setElements, elementState }: Partial<pageEditProps>) => {

    if (!selectedTarget!.current || elementState === CurrentState.RESIZING) return;
    const boxId = selectedTarget!.current;

    const container = document.getElementById("canvas-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const x = event!.clientX - rect.left - (pointerOffset!.current.x ?? 0);
    const y = event!.clientY - rect.top - (pointerOffset!.current.y ?? 0);

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

    const target = event?.target as HTMLElement;
    if (target.dataset.resizepoint) {
        resizeCanvasElement({ event, elementState, pointerOffset, setElements, selectedResizeBorder })
    } else {
        if (selectedMode!.current === Modes.GRAB) {
            updateElementsPosition({ event, pointerOffset, selectedTarget, setElements, elementState, });
        }
    }
};


export const createNewBox = ({ event, setElements, activeTool, setActiveTool }: Partial<pageEditProps>) => {

    if (activeTool === Modes.GRAB) return;

    const boxID = crypto.randomUUID();
    const container = event!.currentTarget.getBoundingClientRect();
    const x = event!.clientX - container.left - 80;
    const y = event!.clientY - container.top - 80;

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
            borderWidth: 2,
            borderStyle: "solid",
            backgroundColor: "#f59e0b",
            useGradient: false,
            gradientStart: "#ec4899",
            gradientEnd: "#8b5cf6",
            gradientAngle: 135,
            size: { width: 11, height: 11 },
            currentState: CurrentState.DRAG
        },
    }));

    setActiveTool!(Modes.GRAB);

};


export const handlePointerDownContainer = ({ event, setElements, selectedMode, selectedTarget, pointerOffset, activeTool, setActiveTool, setElementState, selectedResizeBorder }: Partial<pageEditProps>) => {

    const target = event!.target as HTMLElement;
    const elementNode = target.closest("[data-element-id]");
    const boxId = elementNode?.getAttribute("data-element-id")!;
    const resizePoint = target.dataset.resizepoint ?? null;

    if (resizePoint) {
        updateSelectedTarget({ target, selectedMode, selectedTarget });
        resizeSectionSelected({ resizePoint: resizePoint, props: { event, pointerOffset, setElementState, selectedResizeBorder } });
        return;
    }

    if (target.id === "canvas-container") {
        createNewBox({ event, setElements, activeTool, setActiveTool });
        return;
    }

    updateSelectedTarget({ target, selectedMode, selectedTarget });
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

export function updateSelectedTarget({ target, selectedTarget }:
    {
        target: HTMLElement,
        selectedMode: React.RefObject<Modes> | undefined,
        selectedTarget: React.RefObject<string | null> | undefined
    }) {

    const elementNode = target.closest("[data-element-id]");
    if (!elementNode) return;

    const boxId = elementNode.getAttribute("data-element-id")!;
    selectedTarget!.current = boxId;
}


export const handlePointerUp = ({ selectedMode, selectedTarget, setElementState }: Partial<pageEditProps>) => {
    selectedMode!.current = Modes.GRAB;
    selectedTarget!.current = null;
    setElementState!(_ => CurrentState.DRAG);
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