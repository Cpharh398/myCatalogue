import type { ElementAttr, Position } from "~/util/types";
import { getCanvasScale } from "~/util/layoutUnits";

export const updateElementStyle = (id: string, updater: (element: ElementAttr) => ElementAttr, setElements: (value: React.SetStateAction<Record<string, ElementAttr>>) => void) => {
    if(!id)return;
    setElements(prev => updateNestedElement(prev, id, updater));
};


export function toggleToolBox(
  elements: Record<string, ElementAttr>,
  targetId: string | null,
): Record<string, ElementAttr> {

  const result: Record<string, ElementAttr> = {};

  for (const [id, element] of Object.entries(elements)) {

    let updatedChildren: Record<string, ElementAttr> | undefined = undefined;
    if (element.canvasChildren && Object.keys(element.canvasChildren).length > 0) {
        updatedChildren = toggleToolBox(element.canvasChildren, targetId);
      }

    result[id] = {
    ...element,
    showToolBox: targetId ? id === targetId: false,
    ...(updatedChildren ? { canvasChildren: updatedChildren } : {}),
    };
  }

  return result;
}



export function removeElementFromTree({
  elements,
  targetId
}:{
  elements: Record<string, ElementAttr>,
  targetId: string,
}
): Record<string, ElementAttr> {

  const result: Record<string, ElementAttr> = {};

  for (const [id, element] of Object.entries(elements)) {
    
    let updatedChildren: Record<string, ElementAttr> | undefined = undefined;
    
    if (element.canvasChildren && Object.keys(element.canvasChildren).length > 0) {
      updatedChildren = removeElementFromTree({ elements:element.canvasChildren, targetId:targetId});
    }
  
    if (id !== targetId) {
      result[id] = {
      ...element,
      ...(updatedChildren ? { canvasChildren: updatedChildren } : {}),
    };
    } 
  }
  return result;
}



export function updateNestedElement(

  elements: Record<string, ElementAttr>,
  targetId: string,
  updater: (element: ElementAttr) => ElementAttr
): Record<string, ElementAttr> {

  const result: Record<string, ElementAttr> = {};
  for (const [id, element] of Object.entries(elements)) {
    if (id === targetId) {
      result[id] = updater(element);
      // console.log(result[id]);
    } else {
      let updatedChildren: Record<string, ElementAttr>  = {};

      if (element.canvasChildren && Object.keys(element.canvasChildren).length > 0) {
        updatedChildren = updateNestedElement(element.canvasChildren, targetId, updater);
      }


      result[id] = {
        ...element,
        ...{ canvasChildren: updatedChildren },
      };
    }
  }

  return result;
}


export const getRezingCursorStyle = (resizePoint: string) => {
    switch (resizePoint) {

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

export const findInTree = (tree: Record<string, ElementAttr> | undefined,id: string): ElementAttr | undefined => {
  if(!tree) return;
    // console.log(tree)
    // console.log(id)
      for (const [key, val] of Object.entries(tree)) {
        if (key === id) return val;
        if (val.canvasChildren) {
          const found = findInTree(val.canvasChildren, id);
          if (found) return found;
        }
      }
      return undefined;
    };


export const findInTreeByState = (tree: Record<string, ElementAttr>, state: keyof ElementAttr, equator:any): { id:string, element: ElementAttr } | undefined => {
      for (const [key, val] of Object.entries(tree)) {
        if (val[state] === equator) return { id:key, element:val };
        if (val.canvasChildren) {
          const found = findInTreeByState(val.canvasChildren, state, equator);
          if (found) return found;
        }
      }
      return undefined;
    };

export const getContainerRelativePosition = (
  container: HTMLElement,
  event: React.PointerEvent<Element> | undefined,
  pointerOffset: React.RefObject<Position> | undefined,
  isControlPanel?:Boolean,
  layoutScale?: { x: number; y: number },
  )=>{

  const rect = container.getBoundingClientRect();
  const scrollX = isControlPanel ? 0 : container.scrollLeft;
  const scrollY = isControlPanel ? 0 : container.scrollTop;
  const pixelScaleX = isControlPanel ? 16 : layoutScale?.x || getCanvasScale(container);
  const pixelScaleY = isControlPanel ? 16 : layoutScale?.y || getCanvasScale(container);
  
  let x = (event!.clientX - (isControlPanel ? rect.right : rect.left) + scrollX - (pointerOffset!.current.x ?? 0)) / pixelScaleX ;
  let y = (event!.clientY - rect.top + scrollY - (pointerOffset!.current.y ?? 0)) / pixelScaleY ;

  return { x, y };
}

export function getElementPixelScale(elements: Record<string, ElementAttr>, elementId: string): { x: number; y: number } {
  const canvas = typeof document === "undefined" ? null : document.getElementById("canvas-container");
  const fallback = getCanvasScale(canvas);
  const element = findInTree(elements, elementId);
  const parentId = element?.currentStateInTree?.parentElementID;
  if (!parentId || typeof document === "undefined") return { x: fallback, y: fallback };

  const parent = findInTree(elements, parentId);
  const parentNode = Array.from(document.querySelectorAll<HTMLElement>("[data-element-id]"))
    .find(node => node.dataset.elementId === parentId);
  if (!parent || !parentNode) return { x: fallback, y: fallback };

  const device = canvas?.dataset.gridDevice || "desktop";
  const layoutSizes = parent.componentData?.layoutSizes as Partial<Record<string, { width: number; height: number }>> | undefined;
  const basis = layoutSizes?.[device] || parent.size;
  const rect = parentNode.getBoundingClientRect();
  const x = basis?.width ? rect.width / basis.width : fallback;
  const y = basis?.height ? rect.height / basis.height : fallback;
  return { x: Number.isFinite(x) && x > 0 ? x : fallback, y: Number.isFinite(y) && y > 0 ? y : fallback };
}

export function getElementContentPixelScale(elements: Record<string, ElementAttr>, elementId: string): { x: number; y: number } {
  const canvas = typeof document === "undefined" ? null : document.getElementById("canvas-container");
  const fallback = getCanvasScale(canvas);
  const element = findInTree(elements, elementId);
  if (!element || typeof document === "undefined") return { x: fallback, y: fallback };

  const node = Array.from(document.querySelectorAll<HTMLElement>("[data-element-id]"))
    .find(item => item.dataset.elementId === elementId);
  if (!node) return { x: fallback, y: fallback };
  const device = canvas?.dataset.gridDevice || "desktop";
  const layoutSizes = element.componentData?.layoutSizes as Partial<Record<string, { width: number; height: number }>> | undefined;
  const basis = layoutSizes?.[device] || element.size;
  const rect = node.getBoundingClientRect();
  const x = basis?.width ? rect.width / basis.width : fallback;
  const y = basis?.height ? rect.height / basis.height : fallback;
  return { x: Number.isFinite(x) && x > 0 ? x : fallback, y: Number.isFinite(y) && y > 0 ? y : fallback };
}
