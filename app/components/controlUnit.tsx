import React, { useState, useRef, type SetStateAction } from "react";
import { findInTree, removeElementFromTree } from "~/features/util";
import type { BorderRadius, CurrentState, ElementAttr, Position } from "~/util/types";
import { Link, Trash } from "lucide-react"
import { AlignStartVertical, AlignEndVertical, AlignCenterHorizontal, AlignStartHorizontal, AlignCenterVertical, AlignEndHorizontal, Angle } from "lucide-react"
import { ParentElementPreview } from "./elementPreview";

type ToolBoxProps = {
    currentElement: string | null;
    elements: Record<string, ElementAttr>;
    onUpdateStyle: (updater: (prev: ElementAttr) => Partial<ElementAttr>) => void;
    onDeleteElement?: () => void;
    onDelinkElement?: (e: React.MouseEvent<HTMLElement>) => void;
    contolPanelPosition: Position;
    onSetControlPanelPosition: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
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
    contolPanelPosition
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

    return (
        <div
            style={{
                top: contolPanelPosition.y!,
                right: contolPanelPosition.x!,
            }}
            onPointerDown={(event) => onPointerDown(event)}
            onPointerMove={(event) => onSetControlPanelPosition(event)}
            onPointerUp={(event) => onPointerUp(event)}
            className="absolute w-60 bg-[#2c2c2c] text-[#e5e5e5] border-l border-[#383838] hover:cursor-grab shadow-2xl z-50 flex flex-col font-sans text-[11px] select-none overflow-y-auto"
        >
            <MediaAndTextInspector element={element} onUpdateStyle={onUpdateStyle} />
            <PositionControl element={element} props={{ onUpdateStyle, elements }}  />
            <LayoutSection element={element} props={{ onUpdateStyle }} />
            <AppearanceControl setShowIndividualRadius={setShowIndividualRadius} currentUniformRadius={currentUniformRadius} element={element} showIndividualRadius={showIndividualRadius} onUpdateStyle={onUpdateStyle} />
            <FillControl element={element} onUpdateStyle={onUpdateStyle} />
            <StrokeControl element={element} onUpdateStyle={onUpdateStyle} />
            <LinkParentControl element={element}  props={{ onDelinkElement, elements }}/>
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


export function StrokeControl({ element, onUpdateStyle }: { element: ElementAttr; onUpdateStyle: (updater: (prev: ElementAttr) => Partial<ElementAttr>) => void }) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <span className="font-semibold text-[#b3b3b3]">Stroke</span>

            <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded p-1 justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={element.borderColor || "#000000"}
                        onChange={(e) => onUpdateStyle(() => ({ borderColor: e.target.value }))}
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
                            onUpdateStyle(() => ({ borderWidth: Number(e.target.value) }))
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
                    onUpdateStyle(() => ({ borderStyle: e.target.value }));
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

export function FillControl({ element, onUpdateStyle }: { element: ElementAttr; onUpdateStyle: (updater: (prev: ElementAttr) => Partial<ElementAttr>) => void }) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">

                <span className="font-semibold text-[#b3b3b3]">Fill</span>
                <label className="flex items-center gap-1 text-[10px] text-[#808080] cursor-pointer">
                    <input
                        type="checkbox"
                        checked={element.useGradient || false}
                        onChange={(e) => onUpdateStyle(() => ({ useGradient: e.target.checked }))}
                        className="accent-[#0c8ce9]"
                    />
                    Gradient
                </label>
            </div>

            {!element.useGradient ? (
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded p-1 justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={element.backgroundColor || "#ffffff"}
                            onChange={(e) => onUpdateStyle(() => ({ backgroundColor: e.target.value }))}
                            className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                        />
                        <span className="uppercase text-white font-mono">
                            {element.backgroundColor || "#FFFFFF"}
                        </span>
                    </div>
                </div>
            ) : (
                <GradientControls element={element} onUpdateStyle={onUpdateStyle} />
            )}
        </div>
    )
}




type GradientControlsProps = {
    element: ElementAttr
    onUpdateStyle: (updater: (prev: any) => any) => void;
};

export function GradientControls({ element, onUpdateStyle }: GradientControlsProps) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [activeHandle, setActiveHandle] = useState<"start" | "end" | null>(null);

    const startColor = element.gradientStart || "#ffffff";
    const endColor = element.gradientEnd || "#000000";
    const startPos = element.gradientStartPosition ?? 0;
    const endPos = element.gradientEndPosition ?? 100;
    const angle = element.gradientAngle ?? 135;


    // Handle pointer down to begin dragging
    const handlePointerDown = (handle: "start" | "end") => (e: React.PointerEvent) => {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        setActiveHandle(handle);
    };

    // Drag handles to update gradient start/end percentages
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!activeHandle || !sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;

        // Calculate position percentage bounded between 0% and 100%
        const percentage = Math.min(Math.max(Math.round((relativeX / rect.width) * 100), 0), 100);

        if (activeHandle === "start") {
            onUpdateStyle(() => ({ gradientStartPosition: percentage }));
        } else {
            onUpdateStyle(() => ({ gradientEndPosition: percentage }));
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (activeHandle) {
            e.currentTarget.releasePointerCapture(e.pointerId);
            setActiveHandle(null);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 bg-[#1e1e1e] p-2.5 rounded border border-[#383838] text-[10px]">
            {/* 1. INTERACTIVE GRADIENT SLIDER BAR WITH POSITION HANDLES */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#808080] font-medium text-[9px]">
                    <span>Gradient </span>
                </div>

                <div
                    ref={sliderRef}
                    onPointerMove={handlePointerMove}
                    className="relative h-6 w-full rounded border border-[#383838] select-none touch-none overflow-visible"
                    style={{
                        background: `linear-gradient(90deg, ${startColor} ${startPos}%, ${endColor} ${endPos}%)`,
                    }}
                >
                    {/* Draggable Start Handle */}
                    <div
                        data-controlknob="start"
                        onPointerDown={handlePointerDown("start")}
                        onPointerUp={handlePointerUp}
                        title={`Start Color Position (${startPos}%)`}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 flex items-center justify-center"
                        style={{
                            left: `${startPos}%`,
                            backgroundColor: startColor,
                        }}
                    >
                        <div className="w-1 h-1 bg-black/40 rounded-full" />
                    </div>

                    {/* Draggable End Handle */}
                    <div
                        data-controlknob="end"
                        onPointerDown={handlePointerDown("end")}
                        onPointerUp={handlePointerUp}
                        title={`End Color Position (${endPos}%)`}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 flex items-center justify-center"
                        style={{
                            left: `${endPos}%`,
                            backgroundColor: endColor,
                        }}
                    >
                        <div className="w-1 h-1 bg-black/40 rounded-full" />
                    </div>
                </div>
            </div>

            {/* 2. COLOR PICKERS, POSITION INPUTS, AND ANGLE CONTROL */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-[#2c2c2c]">
                {/* Colors & Positions */}
                <div className="flex items-center justify-between">
                    {/* Start Color & Position Input */}
                    <div className="flex items-center flex-col rounded">
                        <input
                            type="color"
                            value={startColor}
                            onChange={(e) => onUpdateStyle(() => ({ gradientStart: e.target.value }))}
                            className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                        />
                        <p className="text-[#808080]">start</p>
                    </div>

                    {/* End Color & Position Input */}
                    <div className="flex flex-col items-center rounded ">
                        <input
                            type="color"
                            value={endColor}
                            onChange={(e) => onUpdateStyle(() => ({ gradientEnd: e.target.value }))}
                            className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                        />
                        <p className="text-[#808080]">End</p>
                    </div>
                </div>

                {/* Gradient Angle Control */}
                <div
                    className="flex items-center justify-between bg-[#2c2c2c] hover:cursor-ew-resize px-2 py-1 rounded border border-[#383838]">
                    <span data-controlknob="angle" className="text-[#808080] text-[9px]">Angle</span>
                    <div className="flex items-center gap-0.5">
                        <input
                            type="number"
                            min={0}
                            max={360}
                            value={angle}
                            onChange={(e) => onUpdateStyle(() => {
                                return { gradientAngle: Math.max(0, Math.min(Number(e.target.value), 360)) }
                            })}
                            className={`w-8 bg-transparent text-white text-right outline-none ${removeDefaultInputButton} text-[10px]`}
                        />
                        <span className="text-[#808080]">°</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


export function LinkParentControl({ element, props }: { element: ElementAttr, props: Partial<ToolBoxProps>}) {
   
    if (!element.currentStateInTree?.isChildElement || !element.currentStateInTree.parentElementID ) return;
    const parentElement = findInTree(props.elements, element.currentStateInTree.parentElementID);

    if(!parentElement)return;

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
                    console.log("Hello World");
                    // Call your delink logic here, e.g., props.onDelinkElement?.(element.id)
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
export function AppearanceControl({ currentUniformRadius, showIndividualRadius, element, onUpdateStyle, setShowIndividualRadius }: { currentUniformRadius: number, showIndividualRadius: boolean, element: ElementAttr, onUpdateStyle: (updater: (prev: ElementAttr) => Partial<ElementAttr>) => void; setShowIndividualRadius: React.Dispatch<React.SetStateAction<boolean>> }) {


    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <span className="font-semibold text-[#b3b3b3]">Appearance</span>

            {/* Opacity & Radius */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span data-controlknob="o" className="text-[#808080] text-[10px] hover:cursor-ew-resize">Opacity</span>
                    <input
                        type="number"
                        min={0}
                        max={1}
                        value={element.lgSreenStyle?.opacity ?? 1}
                        onChange={(e) =>
                            onUpdateStyle!(prev => ({ lgSreenStyle: { ...prev.lgSreenStyle, opacity: Number(e.target.value) } }))
                        }
                        className={`bg-transparent w-full outline-none text-white text-right ${removeDefaultInputButton}`}
                    />
                    <span className="text-[#808080]">%</span>
                </div>

                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span data-controlknob="ra" className="text-[#808080] text-[10px] hover:cursor-ew-resize">Radius</span>
                    <input
                        type="number"
                        min={0}
                        value={currentUniformRadius}
                        onChange={(e) => {
                            onUpdateStyle!((prev) => ({
                                borderRadius: { ...prev.borderRadius, radiusTL: Number(e.target.value), radiusTR: Number(e.target.value), radiusBL: Number(e.target.value), radiusBR: Number(e.target.value) }
                            }))
                        }
                        }

                        // onChange={(e) => handleUniformRadiusChange(Number(e.target.value))}
                        className={`bg-transparent w-full outline-none text-white text-right ${removeDefaultInputButton}`}
                    />
                    <button
                        data-controlknob="ba"
                        title="Individual Corners"
                        onClick={() => setShowIndividualRadius(show => !show)}
                        className={`p-0.5 rounded hover:bg-[#383838] ${showIndividualRadius ? "text-[#0c8ce9]" : "text-[#808080]"
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                                d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expanded 4-Corner Radius inputs */}
            {showIndividualRadius && (
                <div className="grid grid-cols-2 gap-2 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                    <div className="flex items-center gap-1">
                        <span data-controlknob="tl" className="text-[#808080] text-[9px] hover:cursor-ew-resize">TL</span>
                        <input
                            type="number"
                            value={element.borderRadius?.radiusTL ?? 0}
                            onChange={(e) =>
                                onUpdateStyle!((prev) => ({
                                    borderRadius: { ...prev.borderRadius, radiusTL: Number(e.target.value) }
                                }))
                            }
                            className={`bg-[#2c2c2c] w-full text-right text-white rounded px-1 border border-[#383838] ${removeDefaultInputButton}`}
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span data-controlknob="tr" className="text-[#808080] text-[9px] hover:cursor-ew-resize">TR</span>
                        <input
                            type="number"
                            value={element.borderRadius?.radiusTR ?? 0}
                            onChange={(e) =>
                                onUpdateStyle!((prev) => ({
                                    borderRadius: { ...prev.borderRadius, radiusTR: Number(e.target.value) }
                                }))
                            }
                            className={`bg-[#2c2c2c] w-full text-right text-white rounded px-1 border border-[#383838] ${removeDefaultInputButton}`}
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span data-controlknob="bl" className="text-[#808080] text-[9px] hover:cursor-ew-resize">BL</span>
                        <input
                            type="number"
                            value={element.borderRadius?.radiusBL ?? 0}
                            onChange={(e) =>
                                onUpdateStyle!((prev) => ({
                                    borderRadius: { ...prev.borderRadius, radiusBL: Number(e.target.value) }
                                }))
                            }
                            // onChange={(e) => handleSingleRadiusChange("radiusBL", Number(e.target.value))}
                            className={`bg-[#2c2c2c] w-full text-right text-white rounded px-1 border border-[#383838] ${removeDefaultInputButton}`}
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span data-controlknob="br" className="text-[#808080] text-[9px] hover:cursor-ew-resize">BR</span>
                        <input
                            type="number"
                            value={element.borderRadius?.radiusBR ?? 0}
                            // onChange={(e) => handleSingleRadiusChange("radiusBR", Number(e.target.value))}
                            className={`bg-[#2c2c2c] w-full text-right text-white rounded px-1 border border-[#383838] ${removeDefaultInputButton}`}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}


export function PositionControl({ props, element }: { props: Partial<ToolBoxProps>, element: ElementAttr }) {
    
    const PIXEL_SIZE = 16;

    const handleEdgeAlign = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        const target = e.currentTarget;
        const alignDirection = target.dataset.align;

        props.onUpdateStyle!((prev) => {
            const isChildElement = prev.currentStateInTree?.isChildElement;
            const elementWidth = prev.size?.width ?? 0; 
            const elementHeight = prev.size?.height ?? 0;

            let containerWidth = 0;
            let containerHeight = 0;

            if (isChildElement) {
                const parentElementID = prev.currentStateInTree?.parentElementID ?? "";
                const parentElement = findInTree(props.elements!, parentElementID);
                containerWidth = parentElement?.size?.width ?? 0;
                containerHeight = parentElement?.size?.height ?? 0;
            } else {
                const canvasDom = document.getElementById("canvas-container");
                const pixelWidth = canvasDom?.clientWidth ?? window.innerWidth;
                const pixelHeight = canvasDom?.clientHeight ?? window.innerHeight;
                containerWidth = pixelWidth / PIXEL_SIZE;
                containerHeight = pixelHeight / PIXEL_SIZE;
            }

            return {
                position: {
                    ...prev.position,
                    x: alignDirection === "left" ? 0 : alignDirection === "right" ? containerWidth - elementWidth : prev.position.x,    
                    y: alignDirection === "top" ? 0 : alignDirection === "bottom" ? containerHeight - elementHeight : prev.position.y
                }
            };
        });
    }

    const handleCenterElement = (e:  React.MouseEvent<HTMLButtonElement, MouseEvent>) => { 
        e.stopPropagation();
        const target = e.currentTarget;
        const centerLine = target.dataset.center;
        
        props.onUpdateStyle!((prev) => {
            const isChildElement = prev.currentStateInTree?.isChildElement;
            const elementWidth = prev.size?.width ?? 0; 
            const elementHeight = prev.size?.height ?? 0; 

            let containerWidth = 0;
            let containerHeight = 0;

            if (isChildElement) {
                const parentElementID = prev.currentStateInTree?.parentElementID ?? "";
                const parentElement = findInTree(props.elements!, parentElementID);
                containerWidth = parentElement?.size?.width ?? 0;
                containerHeight = parentElement?.size?.height ?? 0;
            } else {
                const canvasDom = document.getElementById("canvas-container");
                const pixelWidth = canvasDom?.clientWidth ?? window.innerWidth;
                const pixelHeight = canvasDom?.clientHeight ?? window.innerHeight;
                containerWidth = pixelWidth / PIXEL_SIZE;
                containerHeight = pixelHeight / PIXEL_SIZE;
            }
            const newX = (containerWidth - elementWidth) / 2;
            const newY = (containerHeight - elementHeight) / 2;

            return {
                position: {
                    ...prev.position,
                    x: centerLine === "horizontal" ? newX : prev.position.x,
                    y: centerLine === "vertical" ? newY : prev.position.y
                }
            };
        });
    }



    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">


            <p className="font-light text-[#b3b3b3]">Aligment</p>
            <div className="grid grid-cols-6 gap-0.5 bg-[#1e1e1e] p-1 rounded border border-[#383838]">
                <button
                    data-align="left"
                    title="Align Left"
                    onClick={handleEdgeAlign}
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignStartVertical size={20} />
                </button>

                <button
                    onClick={handleCenterElement}
                    data-center="horizontal"
                    title="Align Horizontal Centers"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignCenterHorizontal size={20} />
                </button>
                <button
                    data-align="right"
                    title="Align Right"
                    onClick={handleEdgeAlign}
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignEndVertical size={20} />
                </button>
                <button
                    onClick={handleEdgeAlign}
                    data-align="top"
                    title="Align Top"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignStartHorizontal size={20} />
                </button>
                <button
                    onClick={handleCenterElement}
                    data-center="vertical"
                    title="Align Vertical Centers"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignCenterVertical size={20} />
                </button>
                <button
                    onClick={handleEdgeAlign}
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
                            props.onUpdateStyle!((prev) => ({
                                size: {
                                    width: Number(e.target.value) / 16,
                                    height: prev.size?.height ?? 1,
                                },
                            }))
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
                            props.onUpdateStyle!((prev) => ({
                                size: {
                                    width: prev.size?.width ?? 1,
                                    height: Number(e.target.value) / 16,
                                },
                            }))
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
  onUpdateStyle: (updater: (prev: ElementAttr) => Partial<ElementAttr>) => void;
};

export function MediaAndTextInspector({ element, onUpdateStyle }: ContentInspectorProps) {
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
    onUpdateStyle(() => ({ content: fileUrl }));
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
              onUpdateStyle(() => ({ content: e.target.value }));
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
                onUpdateStyle(() => ({ content: e.target.value }));
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
