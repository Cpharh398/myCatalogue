import React from "react";
import { Film, Image as ImageIcon, Type } from "lucide-react";
import type { ElementAttr } from "~/util/types";

type ParentPreviewProps = {
  parentElement: ElementAttr;
};

export function ParentElementPreview({ parentElement }: ParentPreviewProps) {
  const tag = (parentElement.elementTag || "div").toLowerCase();

  // Categorize tag types
  const isTextTag = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "button", "text"].includes(tag);
  const isImageTag = ["img", "image"].includes(tag);
  const isVideoTag = ["video"].includes(tag);

  // Compute background style safely (for containers or styled parents)
  const getPreviewBackground = () => {
    if (parentElement.useGradient) {
      const angle = typeof parentElement.gradientAngle === "number"
        ? `${parentElement.gradientAngle}deg`
        : `${parentElement.gradientAngle || "90"}deg`;
      const startPos = parentElement.gradientStartPosition ?? 0;
      const endPos = parentElement.gradientEndPosition ?? 100;

      return `linear-gradient(${angle}, ${parentElement.gradientStart || "#ffffff"} ${startPos}%, ${parentElement.gradientEnd || "#000000"} ${endPos}%)`;
    }
    return parentElement.backgroundColor || "#252525";
  };

  return (
    <div className="w-full flex flex-col gap-1.5 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
      

      {/* MINIATURE PREVIEW CONTAINER */}
      <div className="relative w-full h-16 bg-[#141414] rounded border border-[#2c2c2c] overflow-hidden flex items-center justify-center p-1.5">
        <div
          style={{
            background: getPreviewBackground(),
            borderWidth: `${parentElement.borderWidth ?? 1}px`,
            borderColor: parentElement.borderColor || "#383838",
            borderStyle: parentElement.borderStyle || "solid",
            borderTopLeftRadius: `${parentElement.borderRadius?.radiusTL ?? 0}px`,
            borderTopRightRadius: `${parentElement.borderRadius?.radiusTR ?? 0}px`,
            borderBottomLeftRadius: `${parentElement.borderRadius?.radiusBL ?? 0}px`,
            borderBottomRightRadius: `${parentElement.borderRadius?.radiusBR ?? 0}px`,
          }}
          className="w-full h-full shadow-inner transition-all flex items-center justify-center overflow-hidden p-1 relative"
        >
          {/* 1. IMAGE TAG PREVIEW */}
          {isImageTag && (
            parentElement.content ? (
              <img
                src={parentElement.content}
                alt="Parent preview"
                className="w-full h-full object-contain pointer-events-none select-none rounded-[2px]"
              />
            ) : (
              <div className="flex items-center gap-1 text-[#808080] text-[9px]">
                <ImageIcon size={12} />
                <span>Empty Image</span>
              </div>
            )
          )}

          {/* 2. VIDEO TAG PREVIEW (Non-playable) */}
          {isVideoTag && (
            parentElement.content ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  src={parentElement.content}
                  muted
                  playsInline
                  className="w-full h-full object-cover pointer-events-none select-none opacity-80"
                />
                {/* Non-playable Overlay Indicator */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <div className="p-1 rounded-full bg-black/60 border border-white/20 text-white/80">
                    <Film size={12} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[#808080] text-[9px]">
                <Film size={12} />
                <span>Empty Video</span>
              </div>
            )
          )}

          {/* 3. TEXT TAG PREVIEW (Ellipsis on overflow) */}
          {isTextTag && (
            <div className="w-full h-full flex items-center justify-center px-1">
              <p
                // style={{
                //   color: parentElement.color || "#ffffff",
                //   fontSize: "10px",
                //   lineHeight: "1.2",
                //   textAlign: parentElement.textAlign as any || "center",
                // }}
                className="line-clamp-2 overflow-hidden text-ellipsis break-words font-sans select-none pointer-events-none max-w-full"
                title={parentElement.content || "Empty Text"}
              >
                {parentElement.content || (
                  <span className="italic text-[#808080] flex items-center gap-1">
                    <Type size={10} /> Empty Text
                  </span>
                )}
              </p>
            </div>
          )}

          {/* 4. GENERIC CONTAINER FALLBACK (div, section, etc.) */}
          {!isImageTag && !isVideoTag && !isTextTag && (
            <span className="text-[9px] text-white/40 font-mono select-none pointer-events-none">
              {parentElement.size?.width ?? 0} × {parentElement.size?.height ?? 0}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}