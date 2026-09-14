import React, { useState } from "react";
import { Modes } from "~/util/types";

export type TextSubOption = "heading" | "subheading" | "paragraph";
export type PrebuiltToolType = "accordion" | "productCard" | "form" | "pricingTable" | "hero" | "navbar";

type ToolbarProps = {
  activeTool: Modes;
  isToolBarVisible: Boolean;
  onUpdateToolBarVisibility: (value: boolean) => void;
  onSelectTool: (
    tool: Modes,
    extraData?: { textType?: TextSubOption; aiPrompt?: string; componentType?: PrebuiltToolType }
  ) => void;
};

// ---------------------------------------------------------------------------
// PREBUILT COMPONENTS DEFINITION (WITH MINI SVG PREVIEWS)
// ---------------------------------------------------------------------------
const prebuiltComponents: { type: PrebuiltToolType; label: string; description: string; preview: React.ReactNode }[] = [
  {
    type: "accordion",
    label: "Accordion",
    description: "Collapsible content list",
    preview: (
      <svg className="w-8 h-6 text-slate-400" viewBox="0 0 32 24" fill="currentColor">
        <rect x="2" y="3" width="28" height="5" rx="1" fill="#475569" />
        <rect x="2" y="10" width="28" height="5" rx="1" fill="#334155" />
        <rect x="2" y="17" width="28" height="5" rx="1" fill="#334155" />
      </svg>
    ),
  },
  {
    type: "productCard",
    label: "Product Card",
    description: "E-commerce item display",
    preview: (
      <svg className="w-8 h-6 text-slate-400" viewBox="0 0 32 24" fill="currentColor">
        <rect x="4" y="2" width="24" height="20" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
        <rect x="7" y="5" width="18" height="8" rx="1" fill="#475569" />
        <rect x="7" y="15" width="12" height="2" rx="0.5" fill="#94a3b8" />
        <rect x="21" y="14" width="4" height="4" rx="1" fill="#2563eb" />
      </svg>
    ),
  },
  {
    type: "form",
    label: "Contact Form",
    description: "Input fields & submit button",
    preview: (
      <svg className="w-8 h-6 text-slate-400" viewBox="0 0 32 24" fill="currentColor">
        <rect x="4" y="3" width="24" height="4" rx="1" fill="#475569" />
        <rect x="4" y="9" width="24" height="4" rx="1" fill="#475569" />
        <rect x="4" y="15" width="10" height="5" rx="1" fill="#2563eb" />
      </svg>
    ),
  },
  {
    type: "pricingTable",
    label: "Pricing Table",
    description: "Multi-tier plan comparison",
    preview: (
      <svg className="w-8 h-6 text-slate-400" viewBox="0 0 32 24" fill="currentColor">
        <rect x="3" y="3" width="12" height="18" rx="1" fill="#334155" />
        <rect x="17" y="3" width="12" height="18" rx="1" fill="#2563eb" />
      </svg>
    ),
  },
  {
    type: "hero",
    label: "Hero Section",
    description: "Main banner with call-to-action",
    preview: (
      <svg className="w-8 h-6 text-slate-400" viewBox="0 0 32 24" fill="currentColor">
        <rect x="2" y="2" width="28" height="20" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <rect x="6" y="6" width="14" height="3" rx="0.5" fill="#f8fafc" />
        <rect x="6" y="11" width="10" height="2" rx="0.5" fill="#94a3b8" />
        <rect x="6" y="15" width="6" height="3" rx="1" fill="#2563eb" />
      </svg>
    ),
  },
  {
    type: "navbar",
    label: "Navigation Bar",
    description: "Header with brand logo and links",
    preview: (
      <svg className="w-8 h-6 text-slate-400" viewBox="0 0 32 24" fill="currentColor">
        <rect x="2" y="3" width="28" height="6" rx="1" fill="#334155" />
        <circle cx="6" cy="6" r="1.5" fill="#2563eb" />
        <rect x="16" y="5" width="4" height="2" rx="0.5" fill="#94a3b8" />
        <rect x="22" y="5" width="4" height="2" rx="0.5" fill="#94a3b8" />
      </svg>
    ),
  },
];

export function Toolbar({ activeTool, onSelectTool, isToolBarVisible, onUpdateToolBarVisibility }: ToolbarProps) {
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
      type: Modes.BUTTON,
      label: "Button",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="10" rx="3" strokeWidth="2" />
          <path d="M8 12h8" strokeWidth="2" strokeLinecap="round" />
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
      type: Modes.LIBRARY,
      label: "UI Library",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeWidth="2" strokeLinecap="round" />
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
    setHoveredTool(null);
  };

  const handleSelectComponent = (compType: PrebuiltToolType) => {
    onSelectTool(Modes.LIBRARY, { componentType: compType });
    setHoveredTool(null);
  };

  const handleSubmitAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    onSelectTool(Modes.AI, { aiPrompt });
    setShowAiInput(false);
    setAiPrompt("");
  };

  if (!isToolBarVisible) {
    return (
      <div className="fixed left-2 top-1/2 -translate-y-1/2 z-50">
        <button
          type="button"
          onClick={() => onUpdateToolBarVisibility(true)}
          title="Expand Toolbar"
          className="w-10 h-10 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 hover:scale-105 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 17l5-5-5-5M6 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 fixed left-2 top-1/2 -translate-y-1/2 z-50 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1">
      <button
        type="button"
        onClick={() => onUpdateToolBarVisibility(false)}
        title="Minimize Toolbar"
        className="w-full py-1 mb-0.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="w-full h-[1px] bg-slate-800 mb-0.5" />

      {elementsList.map((item) => {
        const isTextTool = item.type === Modes.TEXT;
        const isLibraryTool = item.type === Modes.LIBRARY;
        const isAiTool = item.type === Modes.AI;
        const isHovered = hoveredTool === item.type;

        return (
          <div
            key={item.type}
            className="relative flex items-center"
            onMouseEnter={() => setHoveredTool(item.type)}
            onMouseLeave={() => setHoveredTool(null)}
          >
            {/* Tool Trigger Button */}
            <button
              onClick={() => {
                if (isAiTool) {
                  setShowAiInput((prev) => !prev);
                } else if (!isTextTool && !isLibraryTool) {
                  setShowAiInput(false);
                  onSelectTool(item.type);
                }
              }}
              className={`flex items-center justify-center p-2.5 text-xs font-medium text-slate-300 hover:text-white ${
                item.type === activeTool ? "bg-blue-600/95 text-white" : "hover:bg-blue-600/95"
              } rounded-lg transition-colors`}
            >
              <span className="text-slate-300 hover:text-white">{item.icon}</span>
            </button>

            {/* 1. TEXT TOOL SUBMENU (PERSISTENT ON HOVER OVER MENU & OPTIONS) */}
            {isTextTool && isHovered && (
              <div className="absolute left-full pl-3 top-1/2 -translate-y-1/2 z-50">
                <div className="bg-slate-900/95 text-white rounded-lg border border-slate-700/80 shadow-2xl p-1.5 flex flex-col gap-1 min-w-[140px] relative">
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
              </div>
            )}

            {/* 2. UI COMPONENT LIBRARY SUBMENU WITH PREVIEWS */}
            {isLibraryTool && isHovered && (
              <div className="absolute left-full pl-3 top-1/2 -translate-y-1/2 z-50">
                <div className="bg-slate-900/95 text-white rounded-xl border border-slate-700/80 shadow-2xl p-2 grid grid-cols-2 gap-2 min-w-[320px] relative">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-b border-l border-slate-700/80 rotate-45" />

                  {prebuiltComponents.map((comp) => (
                    <button
                      key={comp.type}
                      onClick={() => handleSelectComponent(comp.type)}
                      className="flex flex-col items-start p-2 bg-slate-800/60 hover:bg-blue-600/80 border border-slate-700/50 hover:border-blue-500 rounded-lg transition-all group/card"
                    >
                      <div className="w-full flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-200 group-hover/card:text-white">
                          {comp.label}
                        </span>
                        {comp.preview}
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover/card:text-slate-200 text-left line-clamp-1">
                        {comp.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. AI PROMPT INPUT POPUP */}
            {isAiTool && showAiInput && (
              <form
                onSubmit={handleSubmitAiPrompt}
                className="absolute left-full pl-3 top-1/2 -translate-y-1/2 z-50"
              >
                <div className="bg-slate-900/95 border border-slate-700/80 rounded-lg p-2 shadow-2xl flex items-center gap-2 min-w-[240px] relative">
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
                </div>
              </form>
            )}

            {/* 4. STANDARD HOVER TOOLTIP FOR OTHER TOOLS */}
            {!isTextTool && !isLibraryTool && !isAiTool && isHovered && (
              <div className="absolute left-full pl-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="px-2.5 py-1 bg-slate-900/95 text-white text-xs font-medium rounded-md border border-slate-700/80 shadow-xl whitespace-nowrap flex items-center relative">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-b border-l border-slate-700/80 rotate-45" />
                  {item.label}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}