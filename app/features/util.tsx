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


export function updateNestedElement(

  elements: Record<string, ElementAttr>,
  targetId: string,
  updater: (element: ElementAttr) => ElementAttr
): Record<string, ElementAttr> {

  const result: Record<string, ElementAttr> = {};

  for (const [id, element] of Object.entries(elements)) {
    if (id === targetId) {
      // Target found! Apply the updater function directly to this element
      result[id] = updater(element);
    } else {
      // Check if the target is inside canvasChildren
      let updatedChildren: Record<string, ElementAttr> | undefined = undefined;

      if (element.canvasChildren && Object.keys(element.canvasChildren).length > 0) {
        updatedChildren = updateNestedElement(element.canvasChildren, targetId, updater);
      }

      result[id] = {
        ...element,
        ...(updatedChildren ? { canvasChildren: updatedChildren } : {}),
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

export const findInTree = (tree: Record<string, ElementAttr>,id: string): ElementAttr | undefined => {
      for (const [key, val] of Object.entries(tree)) {
        if (key === id) return val;
        if (val.canvasChildren) {
          const found = findInTree(val.canvasChildren, id);
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