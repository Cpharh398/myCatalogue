import React, { useEffect, useRef, useState } from "react";
import type { ElementAttr } from "~/util/types";

interface DropVisualizerProps {
  canvasChildren?: Record<string, ElementAttr>;
}

export const DropVisualizer: React.FC<DropVisualizerProps> = ({
  canvasChildren,
}) => {

  const [isDropping, setIsDropping] = useState(false);
  const prevChildrenKeys = useRef<string[]>([]);

  useEffect(() => {
    
    const currentKeys = canvasChildren ? Object.keys(canvasChildren) : [];
    
    // Check if a new child ID was appended to canvasChildren
    const hasNewChild = currentKeys.some(
      (key) => !prevChildrenKeys.current.includes(key)
    );

    if (hasNewChild) {
      setIsDropping(true);
      const timer = setTimeout(() => setIsDropping(false), 500); // Animation duration
      return () => clearTimeout(timer);
    }

    prevChildrenKeys.current = currentKeys;
  }, [Object.keys(canvasChildren ?? 0).length]);

  return (
    <div
      className={`absolute inset-0 transition-transform duration-300 pointer-events-none ${
        isDropping ? "animate-bounce-short ring-2 ring-emerald-400 ring-offset-2" : ""
      }`}
    >
    </div>
  );
};