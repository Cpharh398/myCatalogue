import React, { useState, useRef, type SetStateAction } from "react";
import { findInTree, removeElementFromTree, updateNestedElement } from "~/features/util";
import type { BorderRadius, CurrentState, ElementAttr, Position } from "~/util/types";
import { Link, Trash } from "lucide-react"
import { AlignStartVertical, AlignEndVertical, AlignCenterHorizontal, AlignStartHorizontal, AlignCenterVertical, AlignEndHorizontal, Angle } from "lucide-react"
import { ParentElementPreview } from "./elementPreview";
import { HslaColorPicker } from "./HslaColorPicker";

type ToolBoxProps = {
    currentElement: string | null;
    elements: Record<string, ElementAttr>;
    onUpdateStyle: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
    onDeleteElement?: () => void;
    onDelinkElement?: (e: React.MouseEvent<HTMLElement>) => void;
    contolPanelPosition: Position;
    iscontrolPanelVisible: Boolean;
    onUpdateMinimized: (value: Boolean) => void;
    onSetControlPanelPosition: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
};

const removeDefaultInputButton = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export function ControlPanel({
    elements,
    currentElement,
    onUpdateStyle,
    onPointerDown,
    onPointerUp,
    onSetControlPanelPosition,
    onDeleteElement,
    onDelinkElement,
    contolPanelPosition,
    iscontrolPanelVisible,
    onUpdateMinimized
}: ToolBoxProps) {

    if (!currentElement) return null;

    const element = findInTree(elements, currentElement);
    if (!element) return null;

    const [showIndividualRadius, setShowIndividualRadius] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const tagName = (element.elementTag || "div").toLowerCase();
    const isMediaElement = ["img", "image", "audio", "video"].includes(tagName);

    // Helper for current uniform radius value
    const currentUniformRadius = (
        (element.borderRadius?.radiusTL ?? 0) +
        (element.borderRadius?.radiusTR ?? 0) +
        (element.borderRadius?.radiusBL ?? 0) +
        (element.borderRadius?.radiusBR ?? 0)) / 4;


    if (!iscontrolPanelVisible) {
        return (
            <button
                type="button"
                style={{
                    top: contolPanelPosition.y!,
                    right: contolPanelPosition.x!,
                }}
                onPointerDown={(event) => onPointerDown(event)}
                onPointerMove={(event) => onSetControlPanelPosition(event)}
                onPointerUp={(event) => onPointerUp(event)}
                onClick={() => {
                    onUpdateMinimized(true)
                }}
                title="Expand Inspector"
                className="absolute w-10 h-10 rounded-full bg-[#1e1e1e] text-[#0c8ce9] border border-[#383838] shadow-2xl z-50 flex items-center justify-center hover:scale-110 hover:border-[#0c8ce9] transition-all cursor-grab active:cursor-grabbing"
            >
                {/* Sliders / Inspector Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 11V3M1 14h6M9 8h6M17 16h6" strokeLinecap="round" />
                </svg>
            </button>
        );
    }

    return (
        <div
            style={{
                top: contolPanelPosition.y!,
                right: contolPanelPosition.x!,
            }}
            onPointerDown={(event) => onPointerDown(event)}
            onPointerMove={(event) => onSetControlPanelPosition(event)}
            onPointerUp={(event) => onPointerUp(event)}
            className="absolute w-60 bg-[#2c2c2c] text-[#e5e5e5] border-l border-[#383838] hover:cursor-grab shadow-2xl z-50 flex flex-col font-sans text-[11px] select-none "
        >

            <div
                onPointerDown={e => e.stopPropagation}
                className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-[#383838] cursor-grab active:cursor-grabbing"
            >
                <span className="font-semibold text-[11px] text-[#b3b3b3] uppercase tracking-wider">
                    Control Panel
                </span>
                <button
                    type="button"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onUpdateMinimized(false);
                    }}
                    title="Minimize Panel"
                    className="p-1 rounded text-[#808080] hover:text-white hover:bg-[#383838] transition-colors"
                >
                    {/* Minimize Icon */}
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            <MediaAndTextInspector element={element} currentElement={currentElement} onUpdateStyle={onUpdateStyle} />
            <PositionControl element={element} props={{ onUpdateStyle, elements }} />
            <LayoutSection element={element} props={{ onUpdateStyle }} />
            <AppearanceControl currentElement={currentElement} setShowIndividualRadius={setShowIndividualRadius} currentUniformRadius={currentUniformRadius} element={element} showIndividualRadius={showIndividualRadius} onUpdateStyle={onUpdateStyle} />
            <FillControl element={element} currentElement={currentElement} onUpdateStyle={onUpdateStyle} />
            <StrokeControl element={element} onUpdateStyle={onUpdateStyle} currentElement={currentElement} />
            <LinkParentControl element={element} props={{ onDelinkElement, elements }} />
            <Actions onDeleteElement={onDeleteElement} />
        </div>
    );
}

export function Actions({ onDeleteElement }: Partial<ToolBoxProps>) {
    return (
        <div className="mt-auto p-3 flex flex-col gap-2 bg-[#222222]  border-t border-[#383838]">
            <button
                onClick={() => onDeleteElement?.()}
                className="w-full py-1.5 px-3 bg-red-600/20 hover:cursor-pointer hover:bg-red-600/30 text-red-400 rounded font-medium text-[11px] flex items-center justify-center gap-2 transition-colors border border-red-500/30"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                Remove
            </button>
        </div>
    )
}


export function StrokeControl({ element, onUpdateStyle, currentElement }: { element: ElementAttr; onUpdateStyle: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>, currentElement: string }) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <span className="font-semibold text-[#b3b3b3]">Stroke</span>

            <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded p-1 justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={element.borderColor || "#000000"}
                        onChange={(e) => {
                            onUpdateStyle!(prev => {
                                return updateNestedElement(prev, currentElement!, (el) => {
                                    return {
                                        ...el,
                                        borderColor: e.target.value

                                    }

                                })
                            })
                        }}
                        className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                    />
                    <span className="uppercase text-white font-mono">
                        {element.borderColor || "#000000"}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        min={0}
                        max={10}
                        value={element.borderWidth ?? 0}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onChange={(e) => {
                            e.preventDefault()
                            onUpdateStyle!(prev => {
                                return updateNestedElement(prev, currentElement!, (el) => {
                                    return {
                                        ...el,
                                        borderWidth: Number(e.target.value)

                                    }

                                })
                            })
                        }
                        }
                        className="w-8 bg-[#2c2c2c] text-white text-right rounded px-1 border border-[#383838]"
                    />
                    <span className="text-[#808080]">px</span>
                </div>
            </div>
            <select
                value={element.borderStyle || "solid"}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => {
                    e.stopPropagation();
                    onUpdateStyle!(prev => {
                        return updateNestedElement(prev, currentElement!, (el) => {
                            return {
                                ...el,
                                borderStyle: e.target.value

                            }

                        })
                    })
                }}
                className="bg-[#1e1e1e] border border-[#383838] text-white rounded p-1 outline-none text-[10px]"
            >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
            </select>
        </div>

    )
}

export function FillControl({ element, onUpdateStyle, currentElement }: { element: ElementAttr; onUpdateStyle: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>, currentElement: string }) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">

                <span className="font-semibold text-[#b3b3b3]">Fill</span>
                <label className="flex items-center gap-1 text-[10px] text-[#808080] cursor-pointer">
                    <input
                        type="checkbox"
                        checked={element.useGradient || false}
                        onChange={(e) => {
                            onUpdateStyle!(prev => {
                                return updateNestedElement(prev, currentElement!, (el) => {
                                    return {
                                        ...el,
                                        useGradient: e.target.checked

                                    }

                                })
                            })

                        }}
                        className="accent-[#0c8ce9]"
                    />
                    Gradient
                </label>
            </div>

            {!element.useGradient ? (
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded p-1.5 justify-between">
                    <div className="flex items-center gap-2 w-full">
                        {/* 1. CUSTOM HSLA COLOR PICKER BUTTON */}
                        <HslaColorPicker
                            color={element.backgroundColor || "#ffffff"}
                            onChange={(cssColor) => {
                                onUpdateStyle!((prev) =>
                                    updateNestedElement(prev, currentElement!, (el) => ({
                                        ...el,
                                        backgroundColor: cssColor,
                                    }))
                                );
                            }}
                        />

                        {/* 2. EDITABLE COLOR TEXT FIELD */}
                        <input
                            type="text"
                            value={element.backgroundColor || "#ffffff"}
                            onChange={(e) => {
                                const val = e.target.value;
                                onUpdateStyle!((prev) =>
                                    updateNestedElement(prev, currentElement!, (el) => ({
                                        ...el,
                                        backgroundColor: val,
                                    }))
                                );
                            }}
                            placeholder="#FFFFFF or hsla(...)"
                            className="w-full bg-transparent text-white font-mono text-[10px] outline-none border-none focus:ring-0 uppercase"
                        />
                    </div>
                </div>
            ) : (
                <GradientControls
                    currentElement={currentElement}
                    element={element}
                    onUpdateStyle={onUpdateStyle}
                />
            )}
        </div>
    )
}




type GradientControlsProps = {
    element: ElementAttr,
    currentElement: string
    onUpdateStyle: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
};
export function GradientControls({ element, onUpdateStyle, currentElement }: GradientControlsProps) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [activeHandle, setActiveHandle] = useState<"start" | "end" | null>(null);

    const startColor = element.gradientStart || "hsla(0, 0%, 100%, 1)";
    const endColor = element.gradientEnd || "hsla(0, 0%, 0%, 1)";
    const startPos = element.gradientStartPosition ?? 0;
    const endPos = element.gradientEndPosition ?? 100;
    const angle = element.gradientAngle ?? 135;

    const handlePointerDown = (handle: "start" | "end") => (e: React.PointerEvent) => {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        setActiveHandle(handle);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!activeHandle || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const percentage = Math.min(Math.max(Math.round((relativeX / rect.width) * 100), 0), 100);

        onUpdateStyle((prev) =>
            updateNestedElement(prev, currentElement, (el) => ({
                ...el,
                [activeHandle === "start" ? "gradientStartPosition" : "gradientEndPosition"]: percentage,
            }))
        );
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (activeHandle) {
            e.currentTarget.releasePointerCapture(e.pointerId);
            setActiveHandle(null);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 bg-[#1e1e1e] p-2.5 rounded border border-[#383838] text-[10px]">
            {/* 1. GRADIENT BAR PREVIEW */}
            <div className="flex flex-col gap-1">
                <span className="text-[#808080] font-medium text-[9px]">Gradient Stops</span>

                <div
                    ref={sliderRef}
                    onPointerMove={handlePointerMove}
                    className="relative h-6 w-full rounded border border-[#383838] select-none touch-none overflow-visible"
                    style={{
                        background: `linear-gradient(90deg, ${startColor} ${startPos}%, ${endColor} ${endPos}%)`,
                    }}
                >
                    {/* Start Handle */}
                    <div
                        onPointerDown={handlePointerDown("start")}
                        onPointerUp={handlePointerUp}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing z-10"
                        style={{ left: `${startPos}%`, backgroundColor: startColor }}
                    />

                    {/* End Handle */}
                    <div
                        onPointerDown={handlePointerDown("end")}
                        onPointerUp={handlePointerUp}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing z-10"
                        style={{ left: `${endPos}%`, backgroundColor: endColor }}
                    />
                </div>
            </div>

            {/* 2. HSLA COLOR PICKERS & ANGLE CONTROL */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-[#2c2c2c]">
                <div className="flex items-center justify-around">
                    {/* Custom HSLA Start Color Picker */}
                    <HslaColorPicker
                        label="start"
                        color={startColor}
                        onChange={(cssColor) => {
                            onUpdateStyle((prev) =>
                                updateNestedElement(prev, currentElement, (el) => ({
                                    ...el,
                                    gradientStart: cssColor,
                                }))
                            );
                        }}
                    />

                    {/* Custom HSLA End Color Picker */}
                    <HslaColorPicker
                        label="end"
                        color={endColor}
                        onChange={(cssColor) => {
                            onUpdateStyle((prev) =>
                                updateNestedElement(prev, currentElement, (el) => ({
                                    ...el,
                                    gradientEnd: cssColor,
                                }))
                            );
                        }}
                    />
                </div>

                {/* Angle Input */}
                <div
                    className="flex items-center justify-between bg-[#2c2c2c] hover:cursor-ew-resize px-2 py-1 rounded border border-[#383838]">
                    <span data-controlknob="angle" className="text-[#808080] text-[9px]">Angle</span>
                    <div className="flex items-center gap-0.5">
                        <input
                            type="number"
                            min={0}
                            max={360}
                            value={angle}
                            onChange={(e) => {
                                onUpdateStyle!(prev => {
                                    return updateNestedElement(prev, currentElement!, (el) => {
                                        return {
                                            ...el,
                                            gradientAngle: Math.max(0, Math.min(Number(e.target.value), 360))
                                        }

                                    })
                                })
                            }}
                            className={`w-8 bg-transparent text-white text-right outline-none ${removeDefaultInputButton} text-[10px]`}
                        />
                        <span className="text-[#808080]">°</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LinkParentControl({ element, props }: { element: ElementAttr, props: Partial<ToolBoxProps> }) {

    if (!element.currentStateInTree?.isChildElement || !element.currentStateInTree.parentElementID) return;
    const parentElement = findInTree(props.elements, element.currentStateInTree.parentElementID);

    if (!parentElement) return;

    // Helper to block all pointer event bubbling
    const stopPropagation = (e: React.SyntheticEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            onPointerDown={stopPropagation}
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            className="relative p-3 border-b border-[#383838] flex flex-col gap-2.5"
        >
            <div className="flex items-center justify-between">
                <span className="font-semibold text-[#b3b3b3]">Linked to</span>
            </div>

            {/* Delink Action Box */}
            <div
                onPointerDown={stopPropagation}
                onMouseDown={stopPropagation}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                className="flex items-center border border-[#383838] rounded p-1 justify-between hover:bg-[#383838] cursor-pointer transition-colors"
            >
                <Link className="pointer-events-none text-[#b3b3b3]" size={16} />
                {parentElement ? (
                    <ParentElementPreview parentElement={parentElement} />
                ) : (
                    <div className="text-[10px] text-[#808080] italic">
                        element not found
                    </div>
                )}
            </div>

            {/* Delete Element Trash Button */}
            <button
                type="button"
                onPointerDown={stopPropagation}
                onMouseDown={stopPropagation}
                onClick={props.onDelinkElement}
                className="absolute top-3 right-2 p-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded cursor-pointer transition-colors"
                title="Delete Element"
            >

                <Trash size={15} />
            </button>
        </div>
    );
}


// Constants for standard CSS properties
const BLEND_MODES = [
    "normal", "multiply", "screen", "overlay", "darken", "lighten",
    "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
    "exclusion", "hue", "saturation", "color", "luminosity"
];

const OBJECT_FIT_OPTIONS = ["cover", "contain", "fill", "none", "scale-down"];

const FONT_FAMILIES = [
    "Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Montserrat",
    "Playfair Display", "Merriweather", "Fira Code", "Courier New", "sans-serif", "serif", "monospace"
];

const FONT_WEIGHTS = [
    { label: "Thin (100)", value: "100" },
    { label: "Light (300)", value: "300" },
    { label: "Regular (400)", value: "400" },
    { label: "Medium (500)", value: "500" },
    { label: "Semi Bold (600)", value: "600" },
    { label: "Bold (700)", value: "700" },
    { label: "Extra Bold (800)", value: "800" },
    { label: "Black (900)", value: "900" },
];

const CURSORS = ["default", "pointer", "move", "text", "not-allowed", "grab", "crosshair"];

export function AppearanceControl({
    currentUniformRadius,
    showIndividualRadius,
    element,
    currentElement,
    onUpdateStyle,
    setShowIndividualRadius,
}: {
    currentUniformRadius: number;
    showIndividualRadius: boolean;
    element: ElementAttr;
    currentElement: string;
    onUpdateStyle: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
    setShowIndividualRadius: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const tag = (element.elementTag || "div").toLowerCase();
    const isTextTag = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "button", "text", "input"].includes(tag);
    const isMediaTag = ["img", "image", "video"].includes(tag);

    // Universal helper for updating element attributes cleanly
    const updateProp = (key: keyof React.CSSProperties, value: any) => {
        onUpdateStyle((prev) =>
            updateNestedElement(prev, currentElement, (el) => ({
                ...el,
                lgSreenStyle: {
                    ...el.lgSreenStyle,
                    [key]: value
                }

            }))

        );
    };

    {/* Helper functions to parse and build CSS shadow strings */ }
    const parseShadow = (str?: string) => {
        if (!str || str === "none") return { x: 0, y: 2, blur: 4, spread: 0, color: "rgba(0,0,0,0.25)" };
        // Extract numbers and color
        const matches = str.match(/(-?\d+px)/g);
        const colorMatch = str.match(/rgba?\([^)]+\)|#[a-fA-F0-9]{3,8}|[a-z]+/i);

        return {
            x: matches?.[0] ? parseInt(matches[0], 10) : 0,
            y: matches?.[1] ? parseInt(matches[1], 10) : 2,
            blur: matches?.[2] ? parseInt(matches[2], 10) : 4,
            spread: matches?.[3] ? parseInt(matches[3], 10) : 0,
            color: colorMatch?.[0] || "rgba(0,0,0,0.25)",
        };
    };

    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-3.5 font-sans text-[11px] text-[#b3b3b3] select-none">
            <span className="font-semibold text-white text-[12px]">Appearance</span>

            {/* 1. OPACITY, BLEND MODE & CURSOR */}
            <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                <div className="grid grid-cols-2 gap-2">
                    {/* Cursor */}
                    <div className="flex items-center justify-between bg-[#2c2c2c] px-1.5 py-1 rounded border border-[#383838]">
                        <span className="text-[#808080] text-[9px]">Cursor</span>
                        <select
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            value={element.lgSreenStyle?.cursor || "default"}
                            onChange={(e) => updateProp("cursor", e.target.value)}
                            className="bg-transparent text-white text-[10px] outline-none cursor-pointer text-right max-w-[65px] truncate"
                        >
                            {CURSORS.map((c) => (
                                <option key={c} value={c} className="bg-[#1e1e1e] text-white">{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Mix Blend Mode */}
                <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                    <span className="text-[#808080] text-[9px]">Blend Mode</span>
                    <select
                        value={element.lgSreenStyle?.mixBlendMode || "normal"}
                        onChange={(e) => updateProp("mixBlendMode", e.target.value)}
                        className="bg-transparent text-white text-[10px] outline-none cursor-pointer text-right capitalize"
                    >
                        {BLEND_MODES.map((mode) => (
                            <option key={mode} value={mode} className="bg-[#1e1e1e] text-white">
                                {mode}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 2. MEDIA / IMAGE & VIDEO OPTIONS (Only visible for img / video tags) */}
            {isMediaTag && (
                <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                    <span className="text-[10px] font-semibold text-white">Media Fitting</span>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Object Fit */}
                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                            <span className="text-[#808080] text-[9px]">Object Fit</span>
                            <select
                                value={element.lgSreenStyle?.objectFit || "cover"}
                                onChange={(e) => updateProp("objectFit", e.target.value)}
                                className="bg-transparent text-white text-[10px] outline-none cursor-pointer capitalize"
                            >
                                {OBJECT_FIT_OPTIONS.map((fit) => (
                                    <option key={fit} value={fit} className="bg-[#1e1e1e] text-white">
                                        {fit}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Object Position */}
                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                            <span className="text-[#808080] text-[9px]">Position</span>
                            <input
                                type="text"
                                value={element.lgSreenStyle?.objectPosition || "center"}
                                onChange={(e) => updateProp("objectPosition", e.target.value)}
                                placeholder="center"
                                className="w-14 bg-transparent text-white text-right outline-none text-[10px]"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 3. TYPOGRAPHY CONTROLS (Only visible for text elements) */}
            {isTextTag && (
                <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                    <span className="text-[10px] font-semibold text-white">Typography</span>

                    {/* Font Family */}
                    <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                        <span className="text-[#808080] text-[9px]">Font</span>
                        <select
                            value={element.lgSreenStyle?.fontFamily || "Inter"}
                            onChange={(e) => updateProp("fontFamily", e.target.value)}
                            className="bg-transparent text-white text-[10px] outline-none cursor-pointer max-w-27.5 truncate text-right"
                        >
                            {FONT_FAMILIES.map((font) => (
                                <option key={font} value={font} className="bg-[#1e1e1e] text-white">
                                    {font}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Font Weight */}
                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                            <span className="text-[#808080] text-[9px]">Weight</span>
                            <select
                                value={element.lgSreenStyle?.fontWeight || "400"}
                                onChange={(e) => updateProp("fontWeight", e.target.value)}
                                className="bg-transparent text-white text-[10px] outline-none cursor-pointer text-right max-w-17.5 truncate"
                            >
                                {FONT_WEIGHTS.map((w) => (
                                    <option key={w.value} value={w.value} className="bg-[#1e1e1e] text-white">
                                        {w.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Font Size */}
                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                            <span className="text-[#808080] text-[9px]">Size</span>
                            <div className="flex items-center gap-0.5">
                                <input
                                    type="number"
                                    min={1}
                                    value={element.lgSreenStyle?.fontSize ?? 14}
                                    onChange={(e) => updateProp("fontSize", Number(e.target.value))}
                                    className="w-8 bg-transparent text-white text-right outline-none text-[10px]"
                                />
                                <span className="text-[#808080]">px</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Line Height */}
                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                            <span className="text-[#808080] text-[9px]">Line Ht</span>
                            <input
                                type="text"
                                value={element.lgSreenStyle?.lineHeight ?? "1.5"}
                                onChange={(e) => updateProp("lineHeight", e.target.value)}
                                placeholder="1.5"
                                className="w-10 bg-transparent text-white text-right outline-none text-[10px]"
                            />
                        </div>

                        {/* Letter Spacing */}
                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                            <span className="text-[#808080] text-[9px]">Spacing</span>
                            <div className="flex items-center gap-0.5">
                                <input
                                    type="number"
                                    step="0.5"
                                    value={element.lgSreenStyle?.letterSpacing ?? 0}
                                    onChange={(e) => updateProp("letterSpacing", Number(e.target.value))}
                                    className="w-8 bg-transparent text-white text-right outline-none text-[10px]"
                                />
                                <span className="text-[#808080]">px</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. CORNER RADIUS */}
            <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white">Corner Radius</span>
                    <button
                        title="Toggle Individual Corners"
                        onClick={() => setShowIndividualRadius((show) => !show)}
                        className={`p-1 rounded hover:bg-[#383838] transition-colors ${showIndividualRadius ? "text-[#0c8ce9]" : "text-[#808080]"
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Uniform Radius Input */}
                {!showIndividualRadius ? (
                    <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                        <span className="text-[#808080] text-[9px]">Radius All</span>
                        <div className="flex items-center gap-0.5">
                            <input
                                type="number"
                                min={0}
                                value={currentUniformRadius}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    updateProp("borderRadius", {
                                        radiusTL: val,
                                        radiusTR: val,
                                        radiusBL: val,
                                        radiusBR: val,
                                    });
                                }}
                                className="w-10 bg-transparent text-white text-right outline-none text-[10px]"
                            />
                            <span className="text-[#808080]">px</span>
                        </div>
                    </div>
                ) : (
                    /* 4-Corner Radius Inputs */
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: "TL", key: "radiusTL" },
                            { label: "TR", key: "radiusTR" },
                            { label: "BL", key: "radiusBL" },
                            { label: "BR", key: "radiusBR" },
                        ].map((corner) => (
                            <div key={corner.key} className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                <span className="text-[#808080] text-[9px]">{corner.label}</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={element.borderRadius?.[corner.key as keyof typeof element.borderRadius] ?? 0}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        updateProp("borderRadius", {
                                            ...element.borderRadius,
                                            [corner.key]: val,
                                        });
                                    }}
                                    className="w-8 bg-transparent text-white text-right outline-none text-[10px]"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 5. BACKDROP BLUR & FILTERS */}
            <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                <span className="text-[10px] font-semibold text-white">Effects & Filters</span>

                <div className="grid grid-cols-2 gap-2">
                    {/* ========================================================================= */}
                    {/* 1. BOX SHADOW CONTROL                                                    */}
                    {/* ========================================================================= */}
                    <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                        <span className="text-[10px] font-semibold text-white">Box Shadow</span>
                        {(() => {
                            const bs = parseShadow(element.lgSreenStyle?.boxShadow as string);

                            const updateBoxShadow = (key: string, val: any) => {
                                const updated = { ...bs, [key]: val };
                                const shadowString = `${updated.x}px ${updated.y}px ${updated.blur}px ${updated.spread}px ${updated.color}`;
                                updateProp("boxShadow", shadowString);
                            };

                            return (
                                <div className="flex flex-col gap-1.5">
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Offset X & Y */}
                                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                            <span className="text-[#808080] text-[9px]">X / Y</span>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={bs.x}
                                                    onChange={(e) => updateBoxShadow("x", Number(e.target.value))}
                                                    className="w-5 bg-transparent text-white text-right outline-none text-[10px]"
                                                />
                                                <span className="text-[#808080]">/</span>
                                                <input
                                                    type="number"
                                                    value={bs.y}
                                                    onChange={(e) => updateBoxShadow("y", Number(e.target.value))}
                                                    className="w-5 bg-transparent text-white text-right outline-none text-[10px]"
                                                />
                                            </div>
                                        </div>

                                        {/* Blur & Spread */}
                                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                            <span className="text-[#808080] text-[9px]">Blur/Sprd</span>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={bs.blur}
                                                    onChange={(e) => updateBoxShadow("blur", Number(e.target.value))}
                                                    className="w-5 bg-transparent text-white text-right outline-none text-[10px]"
                                                />
                                                <span className="text-[#808080]">/</span>
                                                <input
                                                    type="number"
                                                    value={bs.spread}
                                                    onChange={(e) => updateBoxShadow("spread", Number(e.target.value))}
                                                    className="w-5 bg-transparent text-white text-right outline-none text-[10px]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color picker + reset */}
                                    <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                        <span className="text-[#808080] text-[9px]">Shadow Color</span>
                                        <div className="flex items-center gap-2">
                                            <HslaColorPicker
                                                color={bs.color}
                                                onChange={(c) => updateBoxShadow("color", c)}
                                            />
                                            <button
                                                onClick={() => updateProp("boxShadow", "none")}
                                                className="text-[9px] text-[#808080] hover:text-white transition-colors"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* ========================================================================= */}
                    {/* 2. TEXT SHADOW CONTROL (For Text Elements)                              */}
                    {/* ========================================================================= */}
                    {isTextTag && (
                        <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                            <span className="text-[10px] font-semibold text-white">Text Shadow</span>
                            {(() => {
                                const ts = parseShadow(element.lgSreenStyle?.textShadow as string);

                                const updateTextShadow = (key: string, val: any) => {
                                    const updated = { ...ts, [key]: val };
                                    // Text shadow has no spread radius in CSS spec
                                    const shadowString = `${updated.x}px ${updated.y}px ${updated.blur}px ${updated.color}`;
                                    updateProp("textShadow", shadowString);
                                };

                                return (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Offset X & Y */}
                                            <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                                <span className="text-[#808080] text-[9px]">X / Y</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={ts.x}
                                                        onChange={(e) => updateTextShadow("x", Number(e.target.value))}
                                                        className="w-5 bg-transparent text-white text-right outline-none text-[10px]"
                                                    />
                                                    <span className="text-[#808080]">/</span>
                                                    <input
                                                        type="number"
                                                        value={ts.y}
                                                        onChange={(e) => updateTextShadow("y", Number(e.target.value))}
                                                        className="w-5 bg-transparent text-white text-right outline-none text-[10px]"
                                                    />
                                                </div>
                                            </div>

                                            {/* Blur */}
                                            <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                                <span className="text-[#808080] text-[9px]">Blur</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={ts.blur}
                                                    onChange={(e) => updateTextShadow("blur", Number(e.target.value))}
                                                    className="w-6 bg-transparent text-white text-right outline-none text-[10px]"
                                                />
                                            </div>
                                        </div>

                                        {/* Color & Clear */}
                                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                            <span className="text-[#808080] text-[9px]">Color</span>
                                            <div className="flex items-center gap-2">
                                                <HslaColorPicker
                                                    color={ts.color}
                                                    onChange={(c) => updateTextShadow("color", c)}
                                                />
                                                <button
                                                    onClick={() => updateProp("textShadow", "none")}
                                                    className="text-[9px] text-[#808080] hover:text-white transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* 3. FILTER DROP SHADOW (CSS filter: drop-shadow(...))                      */}
                    {/* ========================================================================= */}
                    <div className="flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                        <span className="text-[10px] font-semibold text-white">Filter Drop Shadow</span>
                        {(() => {
                            // Extract drop-shadow(...) out of current filter string if present
                            const currentFilter = (element.lgSreenStyle?.filter as string) || "";
                            const dropMatch = currentFilter.match(/drop-shadow\(([^)]+)\)/);
                            const ds = parseShadow(dropMatch?.[1]);

                            const updateDropShadow = (key: string, val: any) => {
                                const updated = { ...ds, [key]: val };
                                const dropShadowStr = `drop-shadow(${updated.x}px ${updated.y}px ${updated.blur}px ${updated.color})`;

                                // Replace or append drop-shadow in the filter string without overwriting blur(...)
                                let newFilter = currentFilter;
                                if (currentFilter.includes("drop-shadow")) {
                                    newFilter = currentFilter.replace(/drop-shadow\([^)]+\)/, dropShadowStr);
                                } else {
                                    newFilter = `${currentFilter} ${dropShadowStr}`.trim();
                                }

                                updateProp("filter", newFilter);
                            };

                            const clearDropShadow = () => {
                                const newFilter = currentFilter.replace(/drop-shadow\([^)]+\)/, "").trim();
                                updateProp("filter", newFilter || "none");
                            };

                            return (
                                <div className="flex flex-col gap-1.5">
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Offset X & Y */}
                                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                            <span className="text-[#808080] text-[9px]">X / Y</span>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={ds.x}
                                                    onChange={(e) => updateDropShadow("x", Number(e.target.value))}
                                                    className="w-5 bg-transparent text-white text-right outline-none text-[10px]"
                                                />
                                                <span className="text-[#808080]">/</span>
                                                <input
                                                    type="number"
                                                    value={ds.y}
                                                    onChange={(e) => updateDropShadow("y", Number(e.target.value))}
                                                    className="w-5 bg-transparent text-white text-right outline-none text-[10px]"
                                                />
                                            </div>
                                        </div>

                                        {/* Blur */}
                                        <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                            <span className="text-[#808080] text-[9px]">Blur</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={ds.blur}
                                                onChange={(e) => updateDropShadow("blur", Number(e.target.value))}
                                                className="w-6 bg-transparent text-white text-right outline-none text-[10px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Color & Clear */}
                                    <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                                        <span className="text-[#808080] text-[9px]">Color</span>
                                        <div className="flex items-center gap-2">
                                            <HslaColorPicker
                                                color={ds.color}
                                                onChange={(c) => updateDropShadow("color", c)}
                                            />
                                            <button
                                                onClick={clearDropShadow}
                                                className="text-[9px] text-[#808080] hover:text-white transition-colors"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Image/Element Blur Filter */}
                    <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                        <span className="text-[#808080] text-[9px]">Blur</span>
                        <div className="flex items-center gap-0.5">
                            <input
                                type="number"
                                min={0}
                                value={
                                    // Extract the numeric px value out of the filter string e.g. "blur(8px)" -> 8
                                    parseInt(element.lgSreenStyle?.filter?.replace("blur(", "") || "0", 10)
                                }
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    // Set the valid CSS filter property
                                    updateProp("filter", val > 0 ? `blur(${val}px)` : "none");
                                }}
                                className="w-8 bg-transparent text-white text-right outline-none text-[10px]"
                            />
                            <span className="text-[#808080]">px</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#2c2c2c] px-2 py-1 rounded border border-[#383838]">
                        <span className="text-[#808080] text-[9px]">Backdrop Blur</span>
                        <div className="flex items-center gap-0.5">
                            <input
                                type="number"
                                min={0}
                                value={
                                    parseInt(element.lgSreenStyle?.backdropFilter?.replace("blur(", "") || "0", 10)
                                }
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    updateProp("backdropFilter", val > 0 ? `blur(${val}px)` : "none");
                                }}
                                className="w-8 bg-transparent text-white text-right outline-none text-[10px]"
                            />
                            <span className="text-[#808080]">px</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export function PositionControl({ props, element }: { props: Partial<ToolBoxProps>, element: ElementAttr }) {

    const PIXEL_SIZE = 16;
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">


            <p className="font-light text-[#b3b3b3]">Aligment</p>
            <div className="grid grid-cols-6 gap-0.5 bg-[#1e1e1e] p-1 rounded border border-[#383838]">
                <button
                    data-align="left"
                    title="Align Left"
                    // onClick={handleEdgeAlign}
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignStartVertical size={20} />
                </button>

                <button
                    // onPointerDown={(e) => e.stopPropagation()}
                    data-align="horizontal"
                    title="Align Horizontal Centers"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignCenterHorizontal size={20} />
                </button>
                <button
                    data-align="right"
                    title="Align Right"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignEndVertical data-align="right" size={20} />
                </button>
                <button
                    // onPointerDown={(e) => e.stopPropagation()}
                    // onClick={handleEdgeAlign}
                    data-align="top"
                    title="Align Top"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignStartHorizontal size={20} />
                </button>
                <button
                    // onPointerDown={(e) => e.stopPropagation()}
                    // onClick={handleCenterElement}
                    data-align="vertical"
                    title="Align Vertical Centers"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignCenterVertical size={20} />
                </button>
                <button
                    // onPointerDown={(e) => e.stopPropagation()}
                    // onClick={handleEdgeAlign}
                    data-align="bottom"
                    title="Align Bottom"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignEndHorizontal size={20} />
                </button>
            </div>

            {/* X / Y Inputs */}
            <span className="font-light text-[#b3b3b3]">Position</span>

            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span data-controlknob="x" className="text-[#808080] font-medium w-5 hover:cursor-ew-resize">X</span>
                    <input
                        type="number"
                        value={Math.round((element.position?.x ?? 0) * 16)}
                        onChange={(e) =>
                            props.onUpdateStyle!((prev) => ({
                                position: { ...prev.position, x: Number(e.target.value) / 16 },
                            }))
                        }
                        className={`bg-transparent ${removeDefaultInputButton} w-full outline-none text-white text-right`}
                    />
                </div>
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span data-controlknob="y" className="text-[#808080] w-5 hover:cursor-ew-resize font-medium">Y</span>
                    <input
                        type="number"
                        value={Math.round((element.position?.y ?? 0) * PIXEL_SIZE)}
                        onChange={(e) =>
                            props.onUpdateStyle!((prev) => ({
                                position: { ...prev.position, y: Number(e.target.value) / PIXEL_SIZE },
                            }))
                        }
                        className={`bg-transparent ${removeDefaultInputButton} w-full outline-none text-white text-right`}
                    />
                </div>
            </div>
            <div className="bg-yellow-200 w-5" >

            </div>

        </div>
    );
}

type LayoutSectionProps = {
    element: ElementAttr
    props: Partial<ToolBoxProps>
}


export function LayoutSection({ element, props }: LayoutSectionProps) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-[#b3b3b3]">Layout</span>
            </div>

            {/* Width / Height Inputs */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span data-controlknob="w" className={`text-[#808080] hover:cursor-ew-resize font-medium`}>W</span>
                    <input
                        type="number"
                        value={Math.round((element.size?.width ?? 1) * 16)}
                        onChange={(e) =>
                            props.onUpdateStyle!(prev => {
                                return updateNestedElement(prev, props.currentElement!, (el) => {
                                    return {
                                        ...el,
                                        size: {
                                            width: Number(e.target.value) / 16,
                                            height: el.size?.height ?? 1,
                                        },
                                    }

                                })
                            })

                        }
                        className={`bg-transparent w-full outline-none text-white text-right ${removeDefaultInputButton}`}
                    />
                </div>
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span data-controlknob="h" className="text-[#808080] hover:cursor-ew-resize font-medium">H</span>
                    <input
                        type="number"
                        value={Math.round((element.size?.height ?? 1) * 16)}

                        onChange={(e) =>
                            props.onUpdateStyle!(prev => {
                                return updateNestedElement(prev, props.currentElement!, (el) => {
                                    return {
                                        ...el,
                                        size: {
                                            width: el.size?.width ?? 1,
                                            height: Number(e.target.value) / 16,

                                        },
                                    }

                                })
                            })

                        }
                        className={`bg-transparent w-full outline-none text-white text-right ${removeDefaultInputButton}`}
                    />
                </div>
            </div>
        </div>
    )
}



type ContentInspectorProps = {
    element: ElementAttr;
    currentElement: string
    onUpdateStyle: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
};

export function MediaAndTextInspector({ element, onUpdateStyle, currentElement }: ContentInspectorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const tag = (element.elementTag || "div").toLowerCase();

    // Categorize tag types
    const isTextElement = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "button", "text"].includes(tag);
    const isImageElement = ["img", "image"].includes(tag);
    const isVideoElement = ["video"].includes(tag);
    const isAudioElement = ["audio"].includes(tag);
    const isMediaElement = isImageElement || isVideoElement || isAudioElement;

    if (!isTextElement && !isMediaElement) {
        return null; // Return null for generic container tags like 'div' or 'section'
    }

    // Handle local file uploads for media elements
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileUrl = URL.createObjectURL(file);
        onUpdateStyle((prev) => updateNestedElement(prev, currentElement, (el) => ({ ...el, content: fileUrl })))
    };

    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5 font-sans text-[11px]">
            {/* SECTION HEADER */}
            <div className="flex items-center justify-between">
                <span className="font-semibold text-[#b3b3b3] uppercase tracking-wider text-[10px]">
                    {isTextElement ? "Content & Typography" : `${tag} Source`}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#1e1e1e] text-[#808080] font-mono text-[9px]">
                    &lt;{tag}&gt;
                </span>
            </div>

            {/* ---------------- 1. TEXT INPUT CONTROL ---------------- */}
            {isTextElement && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-[#808080] text-[10px]">Text Content</label>
                    <textarea
                        rows={3}
                        value={element.content || ""}
                        onChange={(e) => {
                            e.stopPropagation();
                            onUpdateStyle!(prev => {
                                return updateNestedElement(prev, currentElement!, (el) => {
                                    return {
                                        ...el,
                                        content: e.target.value

                                    }

                                })
                            })
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        placeholder="Enter text..."
                        className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#0c8ce9] text-white rounded p-2 outline-none resize-y text-[11px] leading-relaxed transition-colors"
                    />
                </div>
            )}

            {/* ---------------- 2. MEDIA CONTROLS & PREVIEWS ---------------- */}
            {isMediaElement && (
                <div className="flex flex-col gap-2">
                    {/* File Input Trigger */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept={
                            isImageElement ? "image/*" : isVideoElement ? "video/*" : "audio/*"
                        }
                        className="hidden"
                    />

                    {/* Media Preview Box */}
                    <div className="relative w-full min-h-[100px] max-h-[160px] bg-[#1e1e1e] border border-[#383838] rounded flex items-center justify-center overflow-hidden group">
                        {element.content ? (
                            <>
                                {/* IMAGE PREVIEW */}
                                {isImageElement && (
                                    <img
                                        src={element.content}
                                        alt="Preview"
                                        className="w-full h-full object-contain p-1"
                                    />
                                )}

                                {/* VIDEO PREVIEW */}
                                {isVideoElement && (
                                    <video
                                        src={element.content}
                                        controls
                                        className="w-full max-h-[140px] object-contain"
                                    />
                                )}

                                {/* AUDIO PREVIEW */}
                                {isAudioElement && (
                                    <div className="w-full p-2 flex flex-col items-center gap-2">
                                        <svg className="w-8 h-8 text-[#0c8ce9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                        <audio src={element.content} controls className="w-full h-8 scale-90" />
                                    </div>
                                )}
                            </>
                        ) : (
                            /* EMPTY MEDIA PLACEHOLDER */
                            <div className="flex flex-col items-center gap-1 text-[#808080] p-4 text-center">
                                <svg className="w-6 h-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[10px]">No {tag} source loaded</span>
                            </div>
                        )}

                        {/* Quick Upload Overlay on Hover */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-[10px] gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Replace {tag}
                        </button>
                    </div>

                    {/* URL Input Box */}
                    <div className="flex items-center bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0c8ce9] rounded px-2 py-1 gap-1.5">
                        <span className="text-[#808080] text-[9px] font-mono uppercase">URL</span>
                        <input
                            type="text"
                            value={element.content || ""}
                            onChange={(e) => {
                                e.stopPropagation();
                                onUpdateStyle!(prev => {
                                    return updateNestedElement(prev, currentElement!, (el) => {
                                        return {
                                            ...el,
                                            content: e.target.value

                                        }

                                    })
                                })
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            placeholder={`Paste ${tag} URL...`}
                            className="bg-transparent w-full outline-none text-white text-[10px] truncate"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
