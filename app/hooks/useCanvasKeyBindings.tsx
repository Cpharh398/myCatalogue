import { useEffect } from "react";
import { removeElementFromTree } from "~/features/util";
import { CurrentState, type ElementAttr } from "~/util/types";

export function useCanvasKeybindings({
  setElements,
  selectedTarget,
  selectedTargets,
  onUndo,
  onRedo,
  clearSelection,
  
}: {
  setElements:React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
//   targetID:string
  selectedTarget: React.RefObject<string | null>;
  selectedTargets?: React.RefObject<string[]>;
  onUndo?: () => void;
  onRedo?: () => void;
  clearSelection?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {

        //Ignore deletion if user is typing inside an input or textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) onRedo?.(); else onUndo?.();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault(); onRedo?.(); return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {

        const targets = selectedTargets?.current?.length ? selectedTargets.current : selectedTarget.current ? [selectedTarget.current] : [];
        if (targets.length) {
          event.preventDefault(); // Prevent browser back navigation on Backspace

          setElements((prev) => targets.reduce((next, targetId) => removeElementFromTree({ elements: next, targetId }) || next, prev));
          clearSelection?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTarget, selectedTargets, setElements, onUndo, onRedo, clearSelection]);
}
