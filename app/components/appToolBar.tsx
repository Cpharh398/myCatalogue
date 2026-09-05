import React, { useState } from "react";
import { Modes } from "~/util/types";


export type TextSubOption = "heading" | "subheading" | "paragraph";

type ToolbarProps = {
  activeTool: Modes;
  onSelectTool: (tool: Modes, extraData?: { textType?: TextSubOption; aiPrompt?: string }) => void;
};

export function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  const [hoveredTool, setHoveredTool] = useState<Modes | null>(null);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const elementsList: { type: Modes; label: string; icon: React.ReactNode }[] = [
    {
      type: Modes.GRAB,
      label: "Grab",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M7 11.5V5a1.5 1.5 0 113 0v6.5m0-6.5V3a1.5 1.5 0 113 0v8.5m0-8.5V4a1.5 1.5 0 113 0v7.5m0-6.5A1.5 1.5 0 0118 6.5V12a6 6 0 01-6 6h-1a6 6 0 01-4.243-1.757l-1.5-1.5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      type: Modes.CONTAINER,
      label: "Container",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: Modes.PICTURE,
      label: "Image",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      type: Modes.TEXT,
      label: "Text",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 7V4h16v3M9 20h6M12 4v16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: Modes.AUDIO,
      label: "Audio",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12 0a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: Modes.VIDEO,
      label: "Video",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: Modes.AI,
      label: "AI Assistant",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const handleSelectTextOption = (option: TextSubOption) => {
    onSelectTool(Modes.TEXT, { textType: option });
  };

  const handleSubmitAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    onSelectTool(Modes.AI, { aiPrompt });
    setShowAiInput(false);
    setAiPrompt("");
  };

  return (
    <div className="bg-slate-900/90 fixed left-2 top-1/2 -translate-y-1/2 z-50 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1">
      {elementsList.map((item) => {
        const isTextTool = item.type === Modes.TEXT;
        const isAiTool = item.type === Modes.AI;
        const isHovered = hoveredTool === item.type;

        return (
          <div
            key={item.type}
            className="relative flex items-center group"
            onMouseEnter={() => setHoveredTool(item.type)}
            onMouseLeave={() => setHoveredTool(null)}
          >
            {/* Tool Trigger Button */}
            <button
              onClick={() => {
                if (isAiTool) {
                  setShowAiInput((prev) => !prev);
                } else {
                  setShowAiInput(false);
                  onSelectTool(item.type);
                }
              }}
              className={`flex items-center justify-center p-2.5 text-xs font-medium text-slate-300 hover:text-white ${
                item.type === activeTool
                  ? "bg-blue-600/95 text-white"
                  : "hover:bg-blue-600/95"
              } rounded-lg transition-colors`}
            >
              <span className="text-slate-300 group-hover:text-white">
                {item.icon}
              </span>
            </button>

            {/* 1. TEXT TOOL SUBMENU ON HOVER */}
            {isTextTool && isHovered && (
              <div className="absolute left-full ml-3 bg-slate-900/95 text-white rounded-lg border border-slate-700/80 shadow-2xl p-1.5 z-50 flex flex-col gap-1 min-w-[140px] animate-in fade-in slide-in-from-left-1 duration-150">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-b border-l border-slate-700/80 rotate-45" />

                <button
                  onClick={() => handleSelectTextOption("heading")}
                  className="px-3 py-1.5 text-left text-xs font-bold hover:bg-blue-600/80 rounded transition-colors"
                >
                  Heading (H1)
                </button>
                <button
                  onClick={() => handleSelectTextOption("subheading")}
                  className="px-3 py-1.5 text-left text-xs font-semibold hover:bg-blue-600/80 rounded transition-colors"
                >
                  Subheading (H2)
                </button>
                <button
                  onClick={() => handleSelectTextOption("paragraph")}
                  className="px-3 py-1.5 text-left text-xs font-normal text-slate-300 hover:bg-blue-600/80 hover:text-white rounded transition-colors"
                >
                  Paragraph (P)
                </button>
              </div>
            )}

            {/* 2. AI TOOL PROMPT INPUT POPUP ON CLICK */}
            {isAiTool && showAiInput && (
              <form
                onSubmit={handleSubmitAiPrompt}
                className="absolute left-full ml-3 bg-slate-900/95 border border-slate-700/80 rounded-lg p-2 shadow-2xl z-50 flex items-center gap-2 min-w-[240px] animate-in fade-in slide-in-from-left-1 duration-150"
              >
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-b border-l border-slate-700/80 rotate-45" />

                <input
                  type="text"
                  autoFocus
                  placeholder="Ask AI to generate..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded border border-slate-700 px-2 py-1.5 outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                >
                  Generate
                </button>
              </form>
            )}

            {/* 3. STANDARD HOVER TOOLTIP FOR OTHER TOOLS */}
            {!isTextTool && !isAiTool && isHovered && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-medium rounded-md border border-slate-700/80 shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in slide-in-from-left-1 duration-150 flex items-center">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-b border-l border-slate-700/80 rotate-45" />
                {item.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}