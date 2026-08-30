import { CurrentState, type AlignmentGuide, type ElementAttr, type HoveredElementType, type initResizingProps, type pageEditProps, type Position } from "~/util/types";
import { Modes } from "~/util/types";
import { findInTree, findInTreeByState, getContainerRelativePosition, getRezingCursorStyle, removeElementFromTree, toggleToolBox, updateNestedElement } from "./util";

const PIXEL_SIZE = 16;

const resizeCanvasElement = ({ event,setGuide, elementState, pointerOffset, setElements, selectedResizeBorder, selectedTarget }: Partial<pageEditProps>) => {

    if (elementState === CurrentState.RESIZING) {

        const cornerResizePoints = ["br", "tr", "bl", "tl"]

        if (cornerResizePoints.includes(selectedResizeBorder!.current!)) {
            HandleCornerResize({ pointerOffset, setGuide, event, setElements, selectedResizeBorder, selectedTarget });
        } else {
            HandleEdgeResize({ pointerOffset, event, setGuide, setElements, selectedResizeBorder })
        }
    }
};


export const HandleCornerResize = (props: Partial<pageEditProps>) => {
  if (!props.event || !props.pointerOffset?.current || !props.setElements) return;

  const selectedElementID = props.selectedTarget?.current as string;
  const corner = props.selectedResizeBorder?.current; // "tr", "tl", "br", "bl"

  if (!selectedElementID || !corner) return;

  const prevX = props.pointerOffset.current.x!;
  const prevY = props.pointerOffset.current.y!;

  const rawDeltaX = props.event.clientX - prevX;
  const rawDeltaY = props.event.clientY - prevY;

  props.pointerOffset.current = { x: props.event.clientX, y: props.event.clientY };

  const sensitivity = 0.6;

  // Map corner codes to direction handles
  const cornerToDirectionMap: Record<string, string> = {
    tr: "ne",
    tl: "nw",
    br: "se",
    bl: "sw",
  };
  const resizeDirection = cornerToDirectionMap[corner] ?? "";

  props.setElements((prev) => {
    const currentEl = findInTree(prev, selectedElementID);
    if (!currentEl) return prev;

    const isChild = currentEl.currentStateInTree?.isChildElement;
    const parentId = currentEl.currentStateInTree?.parentElementID;

    const parentAbsPos =
      isChild && parentId
        ? getAbsolutePosition(parentId, prev)
        : { x: 0, y: 0 };

    const currentWidth = currentEl.size?.width ?? 1;
    const currentHeight = currentEl.size?.height ?? 1;
    const currentX = currentEl.position?.x ?? 0;
    const currentY = currentEl.position?.y ?? 0;

    const aspectRatio = currentWidth / currentHeight;

    const xDir = corner === "tr" || corner === "br" ? 1 : -1;
    const yDir = corner === "bl" || corner === "br" ? 1 : -1;

    const gridDeltaX = ((rawDeltaX * xDir) / PIXEL_SIZE) * sensitivity;
    const gridDeltaY = ((rawDeltaY * yDir) / PIXEL_SIZE) * sensitivity;

    const combinedDelta = (gridDeltaX + gridDeltaY) / 2;

    const widthDelta = combinedDelta;
    const heightDelta = combinedDelta / aspectRatio;

    let unsnappedWidth = Math.max(1, currentWidth + widthDelta);
    let unsnappedHeight = Math.max(1, currentHeight + heightDelta);

    const actualWidthChange = unsnappedWidth - currentWidth;
    const actualHeightChange = unsnappedHeight - currentHeight;

    let unsnappedX = currentX;
    let unsnappedY = currentY;

    if (corner === "tl" || corner === "bl") {
      unsnappedX = currentX - actualWidthChange;
    }
    if (corner === "tl" || corner === "tr") {
      unsnappedY = currentY - actualHeightChange;
    }

    const { snappedSize, snappedPosition, guides } = calculateResizeSmartGuides({
      draggedId: selectedElementID,
      resizePoint: resizeDirection,
      rawRelativePosition: { x: unsnappedX, y: unsnappedY },
      rawSize: { width: unsnappedWidth, height: unsnappedHeight },
      parentAbsolutePosition: parentAbsPos,
      allElements: prev,
    });

    let finalWidth = snappedSize.width;
    let finalHeight = snappedSize.height;
    let finalX = snappedPosition.x;
    let finalY = snappedPosition.y;

    if (guides.some((g) => g.type === "x")) {
      finalHeight = finalWidth / aspectRatio;
      if (corner === "tl" || corner === "tr") {
        finalY = currentY - (finalHeight - currentHeight);
      }
    } else if (guides.some((g) => g.type === "y")) {
      finalWidth = finalHeight * aspectRatio;
      if (corner === "tl" || corner === "bl") {
        finalX = currentX - (finalWidth - currentWidth);
      }
    }

    // Render guide lines
    props.setGuide?.(guides);

    return updateNestedElement(prev, selectedElementID, (el) => ({
      ...el,
      position: { x: finalX, y: finalY },
      size: { width: finalWidth, height: finalHeight },
    }));
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

  const edgeToDirectionMap: Record<string, string> = {
    right: "e",
    left: "w",
    top: "n",
    bottom: "s",
  };
  const resizeDirection = edgeToDirectionMap[edge] ?? "";

  props.setElements((prev) => {
    const currentEl = findInTree(prev, selectedElementID);
    if (!currentEl) return prev;

    const isChild = currentEl.currentStateInTree?.isChildElement;
    const parentId = currentEl.currentStateInTree?.parentElementID;

    const parentAbsPos =
      isChild && parentId
        ? getAbsolutePosition(parentId, prev)
        : { x: 0, y: 0 };

    const currentWidth = currentEl.size?.width ?? 1;
    const currentHeight = currentEl.size?.height ?? 1;
    const currentX = currentEl.position?.x ?? 0;
    const currentY = currentEl.position?.y ?? 0;

    let unsnappedWidth = currentWidth;
    let unsnappedHeight = currentHeight;
    let unsnappedX = currentX;
    let unsnappedY = currentY;

    // 2. Compute raw relative size and position changes
    if (edge === "right") {
      const deltaWidth = rawDeltaX / PIXEL_SIZE;
      unsnappedWidth = Math.max(1, currentWidth + deltaWidth);
    } else if (edge === "left") {
      const deltaWidth = -rawDeltaX / PIXEL_SIZE;
      unsnappedWidth = Math.max(1, currentWidth + deltaWidth);
      const actualWidthChange = unsnappedWidth - currentWidth;
      unsnappedX = currentX - actualWidthChange;
    }

    if (edge === "bottom") {
      const deltaHeight = rawDeltaY / PIXEL_SIZE;
      unsnappedHeight = Math.max(1, currentHeight + deltaHeight);
    } else if (edge === "top") {
      const deltaHeight = -rawDeltaY / PIXEL_SIZE;
      unsnappedHeight = Math.max(1, currentHeight + deltaHeight);
      const actualHeightChange = unsnappedHeight - currentHeight;
      unsnappedY = currentY - actualHeightChange;
    }

    const { snappedSize, snappedPosition, guides } = calculateResizeSmartGuides({
      draggedId: selectedElementID,
      resizePoint: resizeDirection,
      rawRelativePosition: { x: unsnappedX, y: unsnappedY },
      rawSize: { width: unsnappedWidth, height: unsnappedHeight },
      parentAbsolutePosition: parentAbsPos,
      allElements: prev,
    });

    props.setGuide?.(guides);

    return updateNestedElement(prev, selectedElementID, (el) => ({
      ...el,
      position: snappedPosition,
      size: snappedSize,
    }));
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


export function getElementParentDOMNode(isChild: boolean | undefined, parentId: string | undefined | null) {
    if (isChild && parentId) {
        return document.querySelector(`[data-element-id="${parentId}"]`) as HTMLElement;
    } else {
        return document.getElementById("canvas-container");
    }

}

export const updateElementsPosition = ({
    event,
    elements,
    selectedTarget,
    pointerOffset,
    setElements,
    elementState,
    currentHovered,
    setGuide,
    zIndexUpdated,
    currentDragged,
}: Partial<pageEditProps>) => {

    if (!event || !selectedTarget?.current || elementState === CurrentState.RESIZING) return;

    const boxId = selectedTarget.current;
    const targetEl = elements ? findInTree(elements, boxId) : undefined;

    if (!targetEl) return;

    const isChild = targetEl.currentStateInTree?.isChildElement;
    const parentId = targetEl.currentStateInTree?.parentElementID;


    let referenceDOM: HTMLElement | null = getElementParentDOMNode(isChild, parentId);

    if (!referenceDOM) return;

    const { x, y } = getContainerRelativePosition(referenceDOM, event, pointerOffset);
    const parentAbsPos = (isChild && parentId)
  ? getAbsolutePosition(parentId, elements!)
  : { x: 0, y: 0 };

    const { snappedPosition, guides } = calculateSmartGuides({
    draggedId: boxId,
    rawRelativePosition: {x, y},
    parentAbsolutePosition: parentAbsPos,
    draggedSize: targetEl.size ?? { width: 4, height: 4 },
    allElements: elements!,
    });
    setGuide?.(guides);

    const draggedDOM = document.querySelector(`[data-element-id="${boxId}"]`) as HTMLElement;

    if (draggedDOM) draggedDOM.style.pointerEvents = "none";

    const underCursor = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;

    if (draggedDOM) draggedDOM.style.pointerEvents = "auto";

    const underCursorElementID = underCursor.getAttribute("data-element-id");

    let updatedzIndex: number | null = null;

    if (underCursorElementID && underCursorElementID !== boxId) {

        const hoverTargetEl = elements ? findInTree(elements, underCursorElementID) : undefined;
        const zIndex = hoverTargetEl?.zIndex ?? 0;

        currentDragged!.current = boxId;
        zIndexUpdated!.current = true;
        updatedzIndex = zIndex + 1;

        const { x: newX, y: newY } = getContainerRelativePosition(underCursor, event, pointerOffset);

        currentHovered!.current = {
            elementID: underCursorElementID,
            relativePosition: { x: newX, y: newY },
        };

    } else {
        currentHovered!.current = null;
        currentDragged!.current = null;
    }


    setElements!((prev) => {
        let nextState = updateNestedElement(prev, boxId, (draggedEl) => ({
            ...draggedEl,
            position: snappedPosition,
            zIndex: updatedzIndex ?? draggedEl.zIndex,
            currentState: CurrentState.DRAG,
        }));

        if (isChild && parentId) {
            nextState = updateNestedElement(nextState, parentId, (parentEl) => ({
                ...parentEl,
                zIndex: (updatedzIndex ?? parentEl.zIndex) + 100, // Elevate parent temporarily
            }));
        }

        if (underCursorElementID && underCursorElementID !== boxId) {

            const prevHoveredEl = findInTreeByState(nextState, "currentState", CurrentState.HOVERED);
            if (prevHoveredEl) {
                nextState = updateNestedElement(nextState, prevHoveredEl.id, (hoveredEl) => ({
                    ...hoveredEl,
                    currentState: CurrentState.IDLE,
                }));
            }

            nextState = updateNestedElement(nextState, underCursorElementID, (hoveredEl) => ({
                ...hoveredEl,
                currentState: underCursorElementID !== targetEl.currentStateInTree?.parentElementID  ? CurrentState.HOVERED : hoveredEl.currentState, // only update to hovered if parent element is not the current parent element of the child 
            }));

        } else {
            const prevHoveredEl = findInTreeByState(nextState, "currentState", CurrentState.HOVERED);
            if (prevHoveredEl) {
                nextState = updateNestedElement(nextState, prevHoveredEl.id, (hoveredEl) => ({
                    ...hoveredEl,
                    currentState: CurrentState.IDLE,
                }));
            }
        }

        return nextState;
    });


};


export const handlePointerMove = ({ selectedTarget, selectedMode, event, pointerOffset, setElements, setGuide, elementState, selectedResizeBorder, elements, currentHovered, zIndexUpdated, currentDragged }: Partial<pageEditProps>) => {

    event?.preventDefault();
    if (!selectedTarget!.current) return;

    if (selectedResizeBorder!.current !== null) {
        resizeCanvasElement({ event, elementState, setGuide, pointerOffset, setElements, selectedResizeBorder, selectedTarget })
    } else {
        if (selectedMode!.current === Modes.GRAB) {
            updateElementsPosition({ event, pointerOffset, selectedTarget, setGuide, setElements, elementState, elements, currentHovered, zIndexUpdated, currentDragged });
        }
    }
};


export const createNewBox = ({ event, setElements, activeTool, setActiveTool, lastSelected, selectedTarget, pointerOffset, setElementState, selectedResizeBorder, cursorStyle }: Partial<pageEditProps>) => {

    if (activeTool === Modes.GRAB) {
        setElements!((prev) => toggleToolBox(prev, null));
        return;
    };

    const boxID = crypto.randomUUID();
    const offset = 2;
    const container = event!.currentTarget.getBoundingClientRect();
    const x = (event!.clientX - container.left - offset) / PIXEL_SIZE;
    const y = (event!.clientY - container.top - offset) / PIXEL_SIZE;
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
            }
        },
    }));

    initializeResizing({ target, selectedTarget, props: { event, lastSelected, pointerOffset, setElementState, selectedResizeBorder, cursorStyle, setElements }, resizePoint: "br", elementId: boxID });
    setActiveTool!(Modes.GRAB);
};


export const removeElement = ({ props, currentSelectedElement }: { props: Partial<pageEditProps>, currentSelectedElement?: string }) => {

    if (currentSelectedElement) {
        props.setElements!(prev => removeElementFromTree({ elements: prev, targetId: currentSelectedElement }));
    }
}


export const initializeResizing = ({ target, selectedTarget, props: { event, pointerOffset, lastSelected, setElementState, selectedResizeBorder, cursorStyle, setElements }, resizePoint, elementId }: initResizingProps) => {
    target.setPointerCapture(event!.pointerId);
    updateSelectedTarget({ target, selectedTarget, elementID: elementId, lastSelected });
    resizeSectionSelected({ resizePoint: resizePoint, elementId: elementId, props: { event, pointerOffset, setElementState, selectedResizeBorder, cursorStyle, setElements } });
}


export const handlePointerDownContainer = ({
    event,
    setElements,
    elements,
    lastSelected,
    cursorStyle,
    selectedMode,
    selectedTarget,
    pointerOffset,
    activeTool,
    setActiveTool,
    setElementState,
    selectedResizeBorder,
}: Partial<pageEditProps>) => {
    event?.preventDefault();

    const target = event!.target as HTMLElement;
    const elementNode = target.closest("[data-element-id]") as HTMLElement;
    const boxId = elementNode?.getAttribute("data-element-id")!;
    const resizePoint = target.dataset.resizepoint ?? null;

    if (resizePoint) {
        initializeResizing({
            target,
            selectedTarget,
            props: { event, pointerOffset, lastSelected, setElementState, selectedResizeBorder, cursorStyle, setElements },
            resizePoint,
            elementId: boxId,
        });
        return;
    }

    if (target.id === "canvas-container") {
        createNewBox({
            event,
            setElements,
            activeTool,
            lastSelected,
            setActiveTool,
            selectedTarget,
            pointerOffset,
            setElementState,
            selectedResizeBorder,
            cursorStyle,
        });
        return;
    }

    updateSelectedTarget({ target, selectedTarget, lastSelected });
    selectedMode!.current = Modes.GRAB;

    if (!elementNode) return;

    const rect = elementNode.getBoundingClientRect();

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


export const handlePointerUp = ({ selectedMode, setGuide, selectedTarget, cursorStyle, setElementState, setElements, selectedResizeBorder, event, currentHovered, elements, currentDragged }: Partial<pageEditProps>) => {

    event?.preventDefault();
    const currentSelectedElement = selectedTarget?.current;

    setElementState!(prev => CurrentState.DRAG);

    const hoveredId = currentHovered?.current;
    const draggedId = currentSelectedElement;

    if (hoveredId && draggedId) {

        const draggedElement: ElementAttr | undefined = findInTree(elements, draggedId);

        if (!draggedElement) return;

        setElements!((prev) => {

            let nextState: Record<string, ElementAttr> = { ...prev };

            const parent = findInTree(nextState, hoveredId.elementID);

            if (parent) {

                const updatedChild: ElementAttr = {
                    ...draggedElement,
                    currentState: CurrentState.IDLE,
                    showToolBox: false,
                    currentStateInTree: {
                        isChildElement: true,
                        parentElementID: hoveredId.elementID,
                    },
                    position: { x: hoveredId.relativePosition.x, y: hoveredId.relativePosition.y }
                };

                nextState = { ...removeElementFromTree({ elements: nextState, targetId: draggedId }) }
                
                nextState = updateNestedElement(nextState ,hoveredId.elementID, (parentEl)=>({
                    ...parentEl,
                    currentState: CurrentState.IDLE,
                    canvasChildren: {
                        ...parent.canvasChildren,
                        [draggedId]: updatedChild,
                    },

                }) )

            }

            return nextState;
        });


    } else {

        setElements!((prev) =>
            updateNestedElement(prev, currentSelectedElement ?? "", (el) => ({
                ...el,
                currentState: CurrentState.IDLE,
            }))
        );
    };

    if (currentDragged?.current && currentHovered?.current) {
        currentDragged!.current = null;
        currentHovered!.current = null;
    }

    setGuide?.([]);

    reset({ cursorStyle, selectedMode, selectedTarget, selectedResizeBorder })

};


export function reset({ cursorStyle, selectedMode, selectedTarget, selectedResizeBorder }: Partial<pageEditProps>) {

    const draggedDOM = document.querySelector(`[data-element-id="${selectedTarget?.current}"]`) as HTMLElement;

    if (draggedDOM) draggedDOM.style.pointerEvents = "auto";

    cursorStyle!.current = null;
    selectedMode!.current = Modes.GRAB;
    selectedTarget!.current = null;
    selectedResizeBorder!.current = null;

}



export interface SnapResult {
  snappedPosition: { x: number; y: number };
  guides: AlignmentGuide[];
}

export function calculateSmartGuides({
  draggedId,
  rawRelativePosition,
  parentAbsolutePosition = { x: 0, y: 0 },
  draggedSize,
  allElements,
  threshold = 0.25,
}: {
  draggedId: string;
  rawRelativePosition: { x: number; y: number };
  parentAbsolutePosition?: { x: number; y: number };
  draggedSize: { width: number; height: number };
  allElements: Record<string, ElementAttr>;
  threshold?: number;
}): SnapResult {
  const rawAbsX = rawRelativePosition.x + parentAbsolutePosition.x;
  const rawAbsY = rawRelativePosition.y + parentAbsolutePosition.y;

  let snappedAbsX = rawAbsX;
  let snappedAbsY = rawAbsY;
  const guides: AlignmentGuide[] = [];

  const draggedLeft = rawAbsX;
  const draggedCenterX = rawAbsX + draggedSize.width / 2;
  const draggedRight = rawAbsX + draggedSize.width;

  const draggedTop = rawAbsY;
  const draggedCenterY = rawAbsY + draggedSize.height / 2;
  const draggedBottom = rawAbsY + draggedSize.height;

  const otherElements = flattenElementsTree(allElements).filter(
    (el) => el.id !== draggedId
  );

  for (const target of otherElements) {
    const targetAbsPos = getAbsolutePosition(target.id, allElements);
    const targetWidth = target.size?.width ?? 1;
    const targetHeight = target.size?.height ?? 1;

    const targetLeft = targetAbsPos.x;
    const targetCenterX = targetAbsPos.x + targetWidth / 2;
    const targetRight = targetAbsPos.x + targetWidth;

    const targetTop = targetAbsPos.y;
    const targetCenterY = targetAbsPos.y + targetHeight / 2;
    const targetBottom = targetAbsPos.y + targetHeight;

    const minY = Math.min(draggedTop, targetTop);
    const maxY = Math.max(draggedBottom, targetBottom);
    const vLineStart = minY;
    const vLineLength = maxY - minY;

    const xAlignments = [
      { dragPoint: draggedLeft, targetPoint: targetLeft, offset: 0 },
      { dragPoint: draggedLeft, targetPoint: targetRight, offset: 0 },
      { dragPoint: draggedRight, targetPoint: targetLeft, offset: -draggedSize.width },
      { dragPoint: draggedRight, targetPoint: targetRight, offset: -draggedSize.width },
      { dragPoint: draggedCenterX, targetPoint: targetCenterX, offset: -draggedSize.width / 2 },
    ];

    for (const align of xAlignments) {
      if (Math.abs(align.dragPoint - align.targetPoint) <= threshold) {
        snappedAbsX = align.targetPoint + align.offset;
        guides.push({
          type: "x",
          position: align.targetPoint,
          start: vLineStart,
          length: vLineLength,
        });
        break;
      }
    }


    const minX = Math.min(draggedLeft, targetLeft);
    const maxX = Math.max(draggedRight, targetRight);
    const hLineStart = minX;
    const hLineLength = maxX - minX;

    const yAlignments = [
      { dragPoint: draggedTop, targetPoint: targetTop, offset: 0 },
      { dragPoint: draggedTop, targetPoint: targetBottom, offset: 0 },
      { dragPoint: draggedBottom, targetPoint: targetTop, offset: -draggedSize.height },
      { dragPoint: draggedBottom, targetPoint: targetBottom, offset: -draggedSize.height },
      { dragPoint: draggedCenterY, targetPoint: targetCenterY, offset: -draggedSize.height / 2 },
    ];

    for (const align of yAlignments) {
      if (Math.abs(align.dragPoint - align.targetPoint) <= threshold) {
        snappedAbsY = align.targetPoint + align.offset;
        guides.push({
          type: "y",
          position: align.targetPoint,
          start: hLineStart,
          length: hLineLength,
        });
        break;
      }
    }
  }

  return {
    snappedPosition: {
      x: snappedAbsX - parentAbsolutePosition.x,
      y: snappedAbsY - parentAbsolutePosition.y,
    },
    guides,
  };
}

function flattenElementsTree(
  elements: Record<string, ElementAttr>
): (ElementAttr & { id: string })[] {
  let list: (ElementAttr & { id: string })[] = [];

  for (const [id, el] of Object.entries(elements)) {
    list.push({ ...el, id });
    if (el.canvasChildren) {
      list = list.concat(flattenElementsTree(el.canvasChildren));
    }
  }

  return list;
}

export function getAbsolutePosition(
  elementId: string,
  allElements: Record<string, ElementAttr>
): { x: number; y: number } {
  const el = findInTree(allElements, elementId);
  if (!el) return { x: 0, y: 0 };

  let absX = el.position.x ?? 0;
  let absY = el.position.y ?? 0;

  let currentParentId = el.currentStateInTree?.parentElementID;
  while (currentParentId) {
    const parentEl = findInTree(allElements, currentParentId);
    if (parentEl) {
      absX += parentEl.position.x!;
      absY += parentEl.position.y!;
      currentParentId = parentEl.currentStateInTree?.parentElementID;
    } else {
      break;
    }
  }

  return { x: absX, y: absY };
}

export interface ResizeSnapResult {
  snappedSize: { width: number; height: number };
  snappedPosition: { x: number; y: number };
  guides: AlignmentGuide[];
}

export function calculateResizeSmartGuides({
  draggedId,
  resizePoint, // "e", "w", "s", "n", "se", "sw", "ne", "nw"
  rawRelativePosition,
  rawSize,
  parentAbsolutePosition = { x: 0, y: 0 },
  allElements,
  threshold = 0.25, 
  minSize = { width: 1, height: 1 },
}: {
  draggedId: string;
  resizePoint: string;
  rawRelativePosition: { x: number; y: number };
  rawSize: { width: number; height: number };
  parentAbsolutePosition?: { x: number; y: number };
  allElements: Record<string, ElementAttr>;
  threshold?: number;
  minSize?: { width: number; height: number };
}): ResizeSnapResult {
  let snappedAbsX = rawRelativePosition.x + parentAbsolutePosition.x;
  let snappedAbsY = rawRelativePosition.y + parentAbsolutePosition.y;
  let snappedWidth = rawSize.width;
  let snappedHeight = rawSize.height;

  const guides: AlignmentGuide[] = [];

  const currentLeft = snappedAbsX;
  const currentRight = snappedAbsX + snappedWidth;
  const currentTop = snappedAbsY;
  const currentBottom = snappedAbsY + snappedHeight;

  const otherElements = flattenElementsTree(allElements).filter((el) => el.id !== draggedId);

  for (const target of otherElements) {
    const targetAbsPos = getAbsolutePosition(target.id, allElements);
    const targetWidth = target.size?.width ?? 1;
    const targetHeight = target.size?.height ?? 1;

    const targetLeft = targetAbsPos.x;
    const targetRight = targetAbsPos.x + targetWidth;
    const targetTop = targetAbsPos.y;
    const targetBottom = targetAbsPos.y + targetHeight;

    if (resizePoint.includes("e")) {
      const vLineStart = Math.min(currentTop, targetTop);
      const vLineLength = Math.max(currentBottom, targetBottom) - vLineStart;

      for (const targetX of [targetLeft, targetRight]) {
        if (Math.abs(currentRight - targetX) <= threshold) {
          snappedWidth = Math.max(minSize.width, targetX - currentLeft);
          guides.push({
            type: "x",
            position: targetX,
            start: vLineStart,
            length: vLineLength,
          });
          break;
        }
      }
    }

    if (resizePoint.includes("w")) {
      const vLineStart = Math.min(currentTop, targetTop);
      const vLineLength = Math.max(currentBottom, targetBottom) - vLineStart;

      for (const targetX of [targetLeft, targetRight]) {
        if (Math.abs(currentLeft - targetX) <= threshold) {
          const newWidth = Math.max(minSize.width, currentRight - targetX);
          snappedAbsX = currentRight - newWidth;
          snappedWidth = newWidth;

          guides.push({
            type: "x",
            position: targetX,
            start: vLineStart,
            length: vLineLength,
          });
          break;
        }
      }
    }

    if (resizePoint.includes("s")) {
      const hLineStart = Math.min(currentLeft, targetLeft);
      const hLineLength = Math.max(currentRight, targetRight) - hLineStart;

      for (const targetY of [targetTop, targetBottom]) {
        if (Math.abs(currentBottom - targetY) <= threshold) {
          snappedHeight = Math.max(minSize.height, targetY - currentTop);
          guides.push({
            type: "y",
            position: targetY,
            start: hLineStart,
            length: hLineLength,
          });
          break;
        }
      }
    }

    if (resizePoint.includes("n")) {
      const hLineStart = Math.min(currentLeft, targetLeft);
      const hLineLength = Math.max(currentRight, targetRight) - hLineStart;

      for (const targetY of [targetTop, targetBottom]) {
        if (Math.abs(currentTop - targetY) <= threshold) {
          const newHeight = Math.max(minSize.height, currentBottom - targetY);
          snappedAbsY = currentBottom - newHeight;
          snappedHeight = newHeight;

          guides.push({
            type: "y",
            position: targetY,
            start: hLineStart,
            length: hLineLength,
          });
          break;
        }
      }
    }
  }

  return {
    snappedSize: { width: snappedWidth, height: snappedHeight },
    snappedPosition: {
      x: snappedAbsX - parentAbsolutePosition.x,
      y: snappedAbsY - parentAbsolutePosition.y,
    },
    guides,
  };
}