import React, { useState, type ReactNode } from "react";
import { Modes, type ActiveToolType, type PrebuiltToolType, type ResponsiveDevice, type TextSubOption } from "~/util/types";

type ToolbarProps = {
  activeTool: ActiveToolType;
  onSelectTool: ({tool, extraData}:ActiveToolType
  ) => void;
  selectedSection: "pages" | "catalogue" | "library" | null;
  onSelectSection: (section: "pages" | "catalogue" | "library") => void;
  sectionPanel: ReactNode;
  onPublish: () => void;
  onDashboard: () => void;
  onPreview: () => void;
  onTutorial: () => void;
  isPreview: boolean;
  previewDevice: "desktop" | "tablet" | "mobile";
  onSetPreviewDevice: (device: "desktop" | "tablet" | "mobile") => void;
  responsiveEditDevice: ResponsiveDevice | null;
  onEnterResponsiveEdit: () => void;
  onExitResponsiveEdit: () => void;
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

export function Toolbar({ activeTool, onSelectTool, selectedSection, onSelectSection, sectionPanel, onPublish, onDashboard, onPreview, onTutorial, isPreview, previewDevice, onSetPreviewDevice, responsiveEditDevice, onEnterResponsiveEdit, onExitResponsiveEdit }: ToolbarProps) {
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
    onSelectTool({ tool:Modes.TEXT, extraData:{ textType: option }});
    setHoveredTool(null);
  };

  const handleSelectComponent = (compType: PrebuiltToolType) => {
    onSelectTool( {tool:Modes.LIBRARY, extraData:{componentType: compType}});
    setHoveredTool(null);
  };

  const handleSubmitAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    onSelectTool( { tool: Modes.AI,extraData:{ aiPrompt } } );
    setShowAiInput(false);
    setAiPrompt("");
  };

  return (
    <div className="fixed left-2 top-2 bottom-2 z-50 flex items-center" onPointerDown={event => event.stopPropagation()}>
    <div className="h-full w-[58px] bg-white border border-[#e4dfd5] rounded-2xl shadow-xl p-1.5 flex flex-col items-center gap-1 overflow-visible text-slate-700">
      <button type="button" onClick={onDashboard} title="myCatalogue dashboard" className="w-10 h-10 mb-1 rounded-xl bg-[#315b45] text-white font-bold text-lg">m</button>
      <div className="w-9 h-px bg-[#e8e4dc] mb-1" />

      {!isPreview && elementsList.map((item) => {
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
                  onSelectTool( {tool: item.type});
                }
              }}
              className={`flex items-center justify-center p-2.5 text-xs font-medium ${
                item.type === activeTool.tool ? "bg-[#315b45] text-white" : "text-slate-600 hover:bg-[#f1eee7]"
              } rounded-lg transition-colors`}
            >
              <span className="text-current">{item.icon}</span>
            </button>

            {/* 1. TEXT TOOL SUBMENU (PERSISTENT ON HOVER OVER MENU & OPTIONS) */}
            {isTextTool && isHovered && (
  <div className="absolute left-full pl-3 top-1/2 -translate-y-1/2 z-50">
    <div className="bg-slate-900/95 text-white rounded-2xl border border-slate-700/80 shadow-2xl p-4 flex flex-col gap-2.5 min-w-[260px] relative font-sans">
      {/* Tooltip Pointer Arrow */}
      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 border-b border-l border-slate-700/80 rotate-45" />

      {/* Title Header */}
      <span className="text-xs font-semibold text-slate-300 px-1">
        Default text styles
      </span>

      {/* Heading (H1) Option */}
      <button
        type="button"
        onClick={() => handleSelectTextOption("heading")}
        className="w-full px-4 py-3 text-left bg-slate-800/60 hover:bg-blue-600/30 border border-slate-700/60 hover:border-blue-500/80 rounded-2xl transition-all duration-150 group"
      >
        <span className="block text-xl font-black text-white group-hover:text-blue-200">
          Add a heading
        </span>
      </button>

      {/* Subheading (H2) Option */}
      <button
        type="button"
        onClick={() => handleSelectTextOption("subheading")}
        className="w-full px-4 py-2.5 text-left bg-slate-800/60 hover:bg-blue-600/30 border border-slate-700/60 hover:border-blue-500/80 rounded-2xl transition-all duration-150 group"
      >
        <span className="block text-sm font-bold text-slate-100 group-hover:text-blue-200">
          Add a subheading
        </span>
      </button>

      {/* Body Text Option */}
      <button
        type="button"
        onClick={() => handleSelectTextOption("paragraph")}
        className="w-full px-4 py-2.5 text-left bg-slate-800/60 hover:bg-blue-600/30 border border-slate-700/60 hover:border-blue-500/80 rounded-2xl transition-all duration-150 group"
      >
        <span className="block text-xs font-normal text-slate-300 group-hover:text-blue-200">
          Add a little bit of body text
        </span>
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
      <div className="w-9 h-px bg-[#e8e4dc] my-1" />
      <button title="Pages" onClick={() => onSelectSection("pages")} className={`p-2.5 rounded-lg ${selectedSection === "pages" ? "bg-[#e7efe8] text-[#315b45]" : "hover:bg-[#f1eee7]"}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></button>
      <button title="Shop catalogue" onClick={() => onSelectSection("catalogue")} className={`p-2.5 rounded-lg ${selectedSection === "catalogue" ? "bg-[#e7efe8] text-[#315b45]" : "hover:bg-[#f1eee7]"}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg></button>
      <button title="Component library" onClick={() => onSelectSection("library")} className={`p-2.5 rounded-lg ${selectedSection === "library" ? "bg-[#e7efe8] text-[#315b45]" : "hover:bg-[#f1eee7]"}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg></button>
      {selectedSection && !isPreview && <div className="absolute left-[66px] top-0 bottom-0 w-64 max-h-[calc(100vh-1rem)] overflow-auto rounded-2xl border border-[#e4dfd5] bg-white shadow-2xl p-3 text-slate-800">{sectionPanel}</div>}
      <div className="mt-auto flex flex-col gap-1 items-center">
        {(isPreview || responsiveEditDevice) && <div className="mb-1 flex flex-col gap-1 border-b border-[#e8e4dc] pb-2"><button title="Desktop preview" onClick={()=>onSetPreviewDevice("desktop")} className={`p-2 rounded-lg ${previewDevice==="desktop"?"bg-[#e7efe8] text-[#315b45]":"hover:bg-[#f1eee7]"}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg></button><button title="Tablet preview" onClick={()=>onSetPreviewDevice("tablet")} className={`p-2 rounded-lg ${previewDevice==="tablet"?"bg-[#e7efe8] text-[#315b45]":"hover:bg-[#f1eee7]"}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/></svg></button><button title="Mobile preview" onClick={()=>onSetPreviewDevice("mobile")} className={`p-2 rounded-lg ${previewDevice==="mobile"?"bg-[#e7efe8] text-[#315b45]":"hover:bg-[#f1eee7]"}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg></button></div>}
        {isPreview && previewDevice !== "desktop" && <button title={`Edit ${previewDevice} layout`} onClick={onEnterResponsiveEdit} className="mb-1 rounded-lg bg-[#fff4e7] px-1.5 py-2 text-[9px] font-semibold leading-3 text-[#9b572c] hover:bg-[#fcebd8]">Edit<br/>{previewDevice}</button>}
        {responsiveEditDevice && <button title={`Finish ${responsiveEditDevice} editing`} onClick={onExitResponsiveEdit} className="mb-1 rounded-lg bg-[#e7efe8] px-1.5 py-2 text-[9px] font-semibold leading-3 text-[#315b45] hover:bg-[#dbe8dc]">Done<br/>editing</button>}
        <button title={isPreview ? "Edit site" : "Preview site"} onClick={onPreview} className={`p-2.5 rounded-lg ${isPreview ? "bg-[#e7efe8] text-[#315b45]" : "hover:bg-[#f1eee7]"}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button title="Tutorial" onClick={onTutorial} className="p-2.5 rounded-lg hover:bg-[#f1eee7]"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.6 9a2.5 2.5 0 1 1 4.6 1.4c-1.3 1.2-2.2 1.5-2.2 3.1M12 17h.01"/></svg></button>
        <button title="Publish" onClick={onPublish} className="w-10 h-10 rounded-xl bg-[#315b45] text-white hover:bg-[#254735] grid place-items-center"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12 12 3l7 9h-5l-1 9h-2l-1-9H5Z"/></svg></button>
      </div>
    </div>
    </div>
  );
}
