import { useEffect } from "react";
import { removeElementFromTree } from "~/features/util";
import { CurrentState, type ElementAttr } from "~/util/types";

export function useCanvasKeybindings({
  setElements,
  selectedTarget
  
}: {
  setElements:React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
//   targetID:string
  selectedTarget: React.RefObject<string | null>
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
    //   1. Ignore deletion if user is typing inside an input or textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      // 2. Check for Delete or Backspace key
      if (event.key === "Delete" || event.key === "Backspace") {

        if (selectedTarget.current) {
          event.preventDefault(); // Prevent browser back navigation on Backspace

          // 3. Remove element recursively from state
          setElements((prev) => removeElementFromTree({ elements: prev, targetId:selectedTarget.current! }));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTarget, setElements]);
}