import type { ElementAttr, Position } from "~/util/types";

export const updateElementStyle = (id: string, updater: (prev: ElementAttr) => Partial<ElementAttr>, setElements: (value: React.SetStateAction<Record<string, ElementAttr>>) => void) => {

    setElements!((prev) => ({
        ...prev,
        [id]: {
            ...prev[id],
            ...updater(prev[id]),
        },
    }));
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
  )=>{

  const rect = container.getBoundingClientRect();
  const PIXEL_SIZE = 16;

  let x = (event!.clientX - rect.left - (pointerOffset!.current.x ?? 0)) / PIXEL_SIZE;
  let y = (event!.clientY - rect.top - (pointerOffset!.current.y ?? 0)) / PIXEL_SIZE;

  return { x, y };
}