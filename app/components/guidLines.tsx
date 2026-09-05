import React from "react";
import type { AlignmentGuide } from "~/util/types";

interface AlignmentGuidesOverlayProps {
  guides: AlignmentGuide[];
}

export const AlignmentGuidesOverlay: React.FC<AlignmentGuidesOverlayProps> = ({ guides }) => {
  if (!guides || guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-9999">
      {guides.map((guide, idx) => {
        if (guide.type === "x") {
          // Bounded Vertical Snap Line
          return (
            <div
              key={`x-${idx}`}
              className="absolute border-l border-dashed border-red-500 transition-all pointer-events-none"
              style={{
                left: `${guide.position}rem`,
                top: `${guide.start}rem`,
                height: `${guide.length}rem`,
              }}
            />
          );
        } else {
          // Bounded Horizontal Snap Line
          return (
            <div
              key={`y-${idx}`}
              className="absolute border-t border-dashed border-red-500 transition-all pointer-events-none"
              style={{
                top: `${guide.position}rem`,
                left: `${guide.start}rem`,
                width: `${guide.length}rem`,
              }}
            />
          );
        }
      })}
    </div>
  );
};