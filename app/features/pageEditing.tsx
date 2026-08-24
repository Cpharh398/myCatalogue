import { CurrentState, type ElementAttr, type HoveredElementType, type initResizingProps, type pageEditProps, type Position } from "~/util/types";
import { Modes } from "~/util/types";
import { findInTree, getContainerRelativePosition, getRezingCursorStyle, removeElementFromTree, toggleToolBox, updateNestedElement } from "./util";

const resizeCanvasElement = ({ event, elementState, pointerOffset, setElements, selectedResizeBorder, selectedTarget }: Partial<pageEditProps>) => {

    if (elementState === CurrentState.RESIZING) {

        const cornerResizePoints = ["br", "tr", "bl", "tl"]

        if (cornerResizePoints.includes(selectedResizeBorder!.current!)) {
            HandleCornerResize({ pointerOffset, event, setElements, selectedResizeBorder, selectedTarget });
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

    const prevX = props.pointerOffset.current.x!;
    const prevY = props.pointerOffset.current.y!;

    const rawDeltaX = props.event.clientX - prevX;
    const rawDeltaY = props.event.clientY - prevY;

    props.pointerOffset.current = { x: props.event.clientX, y: props.event.clientY };

    const pixelSize = 16;
    const sensitivity = 0.6;

    props.setElements((prev) => {
        return updateNestedElement(prev, selectedElementID, (currentEl) => {
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
                ...currentEl,
                position: { x: newX, y: newY },
                size: { width: newWidth, height: newHeight },
            };
        });
    });
};


export const HandleEdgeResize = (props: Partial<pageEditProps>) => {
    if (!props.event || !props.pointerOffset?.current || !props.setElements) return;

    const target = props.event.target as HTMLElement;
    const container = target?.closest("[data-element-id]") as HTMLElement;
    const selectedElementID = container?.dataset.elementId as string;
    const edge = props.selectedResizeBorder?.current;

    if (!selectedElementID || !edge) return;

    const prevX = props.pointerOffset.current.x!;
    const prevY = props.pointerOffset.current.y!;

    const rawDeltaX = props.event.clientX - prevX;
    const rawDeltaY = props.event.clientY - prevY;

    props.pointerOffset.current = { x: props.event.clientX, y: props.event.clientY };

    const pixelSize = 16;

    props.setElements((prev) => {
        return updateNestedElement(prev, selectedElementID, (currentEl) => {
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
                ...currentEl,
                position: { x: newX, y: newY },
                size: { width: newWidth, height: newHeight },
            };
        });
    });
};




const resizeSectionSelected = ({
    props,
    resizePoint,
    elementId,
}: {
    props: Partial<pageEditProps>;
    resizePoint: string;
    elementId: string;
}) => {
    props.event!.stopPropagation();
    props.pointerOffset!.current = { x: props.event?.clientX, y: props.event!.clientY };
    props.selectedResizeBorder!.current = resizePoint;
    props.cursorStyle!.current = getRezingCursorStyle(resizePoint);

    props.setElementState!(CurrentState.RESIZING);

    props.setElements!((prev) =>
        updateNestedElement(prev, elementId, (el) => ({
            ...el,
            currentState: CurrentState.RESIZING,
        }))
    );
};



export const updateElementsPosition = ({
  event,
  elements,
  selectedTarget,
  pointerOffset,
  setElements,
  elementState,
  currentHovered,
  zIndexUpdated,
  currentDragged,
}: Partial<pageEditProps>) => {

    if (!event || !selectedTarget?.current || elementState === CurrentState.RESIZING) return;

  const boxId = selectedTarget.current;
  const targetEl = elements ? findInTree(elements, boxId) : undefined;
  if (!targetEl) return;

  // 1. Check if target is a child element
  const isChild = targetEl.currentStateInTree?.isChildElement;
  const parentId = targetEl.currentStateInTree?.parentElementID;

  // 2. Safely locate the reference container (Parent DOM or Canvas Container)
  let referenceDOM: HTMLElement | null = null;

  if (isChild && parentId) {
    // Look up the parent container DOM node directly
    referenceDOM = document.querySelector(`[data-element-id="${parentId}"]`) as HTMLElement;
  } else {
    referenceDOM = document.getElementById("canvas-container");
  }

  // Fallback guard if DOM node isn't ready
  if (!referenceDOM) return;

  // 3. Compute relative (x, y) coordinates cleanly
  const { x, y } = getContainerRelativePosition(referenceDOM, event, pointerOffset);

  // 4. Hit-testing for drag/hover targets (Only if NOT dragging a child within its container)
  if (!isChild) {
    // Hide pointer-events on the dragged box temporarily so elementFromPoint looks THROUGH it
    const draggedDOM = document.querySelector(`[data-element-id="${boxId}"]`) as HTMLElement;
    if (draggedDOM) draggedDOM.style.pointerEvents = "none";

    const underCursor = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
    
    // Restore pointer events
    if (draggedDOM) draggedDOM.style.pointerEvents = "auto";

    const targetContainer = underCursor?.closest("[data-element-id]") as HTMLElement;
    const underCursorElementID = targetContainer?.dataset.elementId;

    let updatedzIndex: number | null = null;

    if (underCursorElementID && underCursorElementID !== boxId) {
      const hoverTargetEl = elements ? findInTree(elements, underCursorElementID) : undefined;
      const zIndex = hoverTargetEl?.zIndex ?? 0;

      currentDragged!.current = boxId;
      zIndexUpdated!.current = true;
      updatedzIndex = zIndex + 1;

      const { x: newX, y: newY } = getContainerRelativePosition(underCursor, event, pointerOffset);

      currentHovered!.current = {
        element: targetContainer,
        elementID: underCursorElementID,
        relativePosition: { x: newX, y: newY },
      };
    } else {
      currentHovered!.current = null;
      currentDragged!.current = null;
    }

    // Update root element position & zIndex in state
    setElements!((prev) => {
      let nextState = updateNestedElement(prev, boxId, (draggedEl) => ({
        ...draggedEl,
        position: { x, y },
        zIndex: updatedzIndex ?? draggedEl.zIndex,
        currentState: CurrentState.DRAG,
      }));

      if (underCursorElementID && underCursorElementID !== boxId) {
        nextState = updateNestedElement(nextState, underCursorElementID, (hoveredEl) => ({
          ...hoveredEl,
          currentState: CurrentState.HOVERED,
        }));
      }

      return nextState;
    });
  } else {
    // 5. CHILD ELEMENT UPDATE: Update relative position inside parent container
    currentDragged!.current = boxId;

    setElements!((prev) =>
      updateNestedElement(prev, boxId, (draggedEl) => ({
        ...draggedEl,
        position: { x, y }, // Relative to parent box bounds
        currentState: CurrentState.DRAG,
      }))
    );
  }
};


export const handlePointerMove = ({ selectedTarget, selectedMode, event, pointerOffset, setElements, elementState, selectedResizeBorder, elements, currentHovered, zIndexUpdated, currentDragged }: Partial<pageEditProps>) => {

    event?.preventDefault();
    if (!selectedTarget!.current) return;
    
    if (selectedResizeBorder!.current !== null) {
        resizeCanvasElement({ event, elementState, pointerOffset, setElements, selectedResizeBorder, selectedTarget })
    } else {
        if (selectedMode!.current === Modes.GRAB) {
            updateElementsPosition({ event, pointerOffset, selectedTarget, setElements, elementState, elements, currentHovered, zIndexUpdated, currentDragged });
        }
    }
};


export const createNewBox = ({ event, setElements, activeTool, setActiveTool, lastSelected, selectedTarget, pointerOffset, setElementState, selectedResizeBorder, cursorStyle }: Partial<pageEditProps>) => {

    if (activeTool === Modes.GRAB) {
        setElements!((prev) => toggleToolBox(prev, null));
        return;
    };

    const boxID = crypto.randomUUID();
    const container = event!.currentTarget.getBoundingClientRect();
    const x = (event!.clientX - container.left - 2) / 16;
    const y = (event!.clientY - container.top - 2) / 16;
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
            transformOrigin: "center center",
            verticalAnchor: "top",
            horizontalAnchor: "left",
            zIndex: 1,
            canvasChildren: {},
            currentStateInTree: {
                isChildElement: false,
                parentElementID: null,
                parentElement:null
            }
        },
    }));

    initializeResizing({ target, selectedTarget, props: { event, lastSelected, pointerOffset, setElementState, selectedResizeBorder, cursorStyle, setElements }, resizePoint: "br", elementId: boxID });
    setActiveTool!(Modes.GRAB);
};


export const removeElement = ({ props, currentSelectedElement }:{ props: Partial<pageEditProps>, currentSelectedElement?:string })=> {

    console.log(props.selectedTarget)
    if (currentSelectedElement) {
        props.setElements!( prev => removeElementFromTree({elements:prev, targetId:currentSelectedElement}));
    }
}



export const initializeResizing = ({ target, selectedTarget, props: { event, pointerOffset,lastSelected, setElementState, selectedResizeBorder, cursorStyle, setElements }, resizePoint, elementId }: initResizingProps) => {
    target.setPointerCapture(event!.pointerId);
    updateSelectedTarget({ target, selectedTarget, elementID: elementId, lastSelected });
    resizeSectionSelected({ resizePoint: resizePoint, elementId: elementId, props: { event, pointerOffset, setElementState, selectedResizeBorder, cursorStyle, setElements } });
}


export const handlePointerDownContainer = ({ event, setElements, elements, lastSelected, cursorStyle, selectedMode, selectedTarget, pointerOffset, activeTool, setActiveTool, setElementState, selectedResizeBorder }: Partial<pageEditProps>) => {

    event?.preventDefault();
    console.log(lastSelected)

    const target = event!.target as HTMLElement;
    const elementNode = target.closest("[data-element-id]");
    const boxId = elementNode?.getAttribute("data-element-id")!;
    const resizePoint = target.dataset.resizepoint ?? null;

//     const elementsAtPoint = document.elementsFromPoint(event!.clientX, event!.clientY);
//     const elementIDs: string[] = [];
//     elementsAtPoint.forEach((el) => {
//     const id = el.getAttribute("data-element-id");
//     if (id && !elementIDs.includes(id)) {
//       elementIDs.push(id);
//     }
//   });
//   const clickedElementID = elementIDs[0] ?? null;

//   console.log("Deepest Clicked Child ID:", clickedElementID);
//   console.log("All Stacked IDs under cursor:", elementIDs);


    // console.log(target);
    // console.log(elements);

    if (resizePoint) {
        initializeResizing({ target, selectedTarget, props: { event, pointerOffset, lastSelected, setElementState, selectedResizeBorder, cursorStyle, setElements }, resizePoint, elementId: boxId });
        return;
    }

    if (target.id === "canvas-container") {
        createNewBox({ event, setElements, activeTool,lastSelected, setActiveTool, selectedTarget, pointerOffset, setElementState, selectedResizeBorder, cursorStyle });
        return;
    }

    updateSelectedTarget({ target, selectedTarget, lastSelected });
    selectedMode!.current = Modes.GRAB;

     const targetEl = elements ? findInTree(elements, boxId) : undefined;
     let rect = elementNode?.getBoundingClientRect();
     
     if(targetEl?.currentStateInTree?.isChildElement){
        rect = targetEl.currentStateInTree.parentElement?.getBoundingClientRect();
     }

    if (!rect) return;

    pointerOffset!.current = {
        x: event!.clientX - rect.left,
        y: event!.clientY - rect.top,
    };

    setElements!((prev) => toggleToolBox(prev, selectedTarget!.current!));
};


export function updateSelectedTarget({ target, selectedTarget, elementID, lastSelected }:
    {
        target: HTMLElement,
        elementID?: string,
        lastSelected: React.RefObject<string | null> | undefined,
        selectedTarget: React.RefObject<string | null> | undefined,
    }) {

    if (elementID) {
        selectedTarget!.current = elementID;
        lastSelected!.current = elementID;
        return;
    }
    
    const elementNode = target.closest("[data-element-id]");
    if (!elementNode) return;
    
    const boxId = elementNode.getAttribute("data-element-id")!;
    selectedTarget!.current = boxId;
    lastSelected!.current = boxId;
}


export const handlePointerUp = ({ selectedMode, selectedTarget, cursorStyle, setElementState, setElements, selectedResizeBorder, event, currentHovered, elements, currentDragged }: Partial<pageEditProps>) => {

    event?.preventDefault();
    let draggedElement: ElementAttr | null = null;
    const currentSelectedElement = selectedTarget?.current;

    setElementState!(_ => CurrentState.DRAG);

    if (currentHovered?.current && currentSelectedElement) {
        draggedElement = elements![currentSelectedElement];
        removeElement({ props: {event, setElements, elements}, currentSelectedElement });
    }

    const hoveredId = currentHovered?.current;
    const draggedId = currentDragged?.current;

    if (hoveredId && draggedId && elements?.[draggedId]) {
        const draggedElement: ElementAttr = elements[draggedId];

        setElements!((prev) => {

            const nextState: Record<string, ElementAttr> = { ...prev };

            const parent = nextState[hoveredId.elementID];

            if (parent) {

                const updatedChild: ElementAttr = {
                    ...draggedElement,
                    currentState: CurrentState.IDLE,
                    showToolBox: false,
                    currentStateInTree: {
                        isChildElement: true,
                        parentElementID: hoveredId.elementID,
                        parentElement: hoveredId.element
                    },
                    position: { x: hoveredId.relativePosition.x, y: hoveredId.relativePosition.y }
                };

                nextState[hoveredId.elementID] = {
                    ...parent,
                    currentState: CurrentState.IDLE,
                    canvasChildren: {
                        ...(parent.canvasChildren ?? {}),
                        [draggedId]: updatedChild,
                    },
                };
            }

            reset({cursorStyle, selectedMode, selectedTarget, selectedResizeBorder})
            
            return nextState;
        });
        
    } else {
        
        setElements!((prev) => {
            const nextState: Record<string, ElementAttr> = {};
            
            Object.keys(prev).forEach((id) => {
                nextState[id] = {
                    ...prev[id],
                    currentState: CurrentState.IDLE
                };
            });
            
            reset({cursorStyle, selectedMode, selectedTarget, selectedResizeBorder})
            return nextState;
        });
    };

    if (currentDragged?.current && currentHovered?.current) {
        currentDragged!.current = null;
        currentHovered!.current = null;
    }


    // cursorStyle!.current = null;
    // selectedMode!.current = Modes.GRAB;
    // selectedTarget!.current = null;
    // selectedResizeBorder!.current = null;

};

export function reset({cursorStyle,selectedMode, selectedTarget, selectedResizeBorder} :Partial<pageEditProps>){
    cursorStyle!.current = null;
    selectedMode!.current = Modes.GRAB;
    selectedTarget!.current = null;
    selectedResizeBorder!.current = null;
}