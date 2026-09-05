import React, { useState, useRef } from "react";
import { findInTree } from "~/features/util";
import type { BorderRadius, ElementAttr, Position } from "~/util/types";
import { Link, Trash } from "lucide-react"
import { AlignStartVertical, AlignEndVertical, AlignCenterHorizontal, AlignStartHorizontal, AlignCenterVertical, AlignEndHorizontal, Angle } from "lucide-react"

type ToolBoxProps = {
    currentElement: string | null;
    elements: Record<string, ElementAttr>;
    onUpdateStyle: (updater: (prev: ElementAttr) => Partial<ElementAttr>) => void;
    onDeleteElement?: (id: string) => void;
    onDelinkElement?: (id: string) => void; // Unnest element from container
    contolPanelPosition:Position;
    onSetControlPanelPosition:(event:React.PointerEvent<HTMLDivElement>)=>void;
    onPointerDown:(event:React.PointerEvent<HTMLDivElement>)=>void;
    onPointerUp:(event:React.PointerEvent<HTMLDivElement>)=>void;
};

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

    const [showIndividualRadius, setShowIndividualRadius] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const tagName = (element.elementTag || "div").toLowerCase();
    const isMediaElement = ["img", "image", "audio", "video"].includes(tagName);

    // Single corner update
    const handleSingleRadiusChange = (corner: keyof BorderRadius, val: number) => {
        const clamped = Math.max(0, val);
        onUpdateStyle((prev) => ({
            borderRadius: {
                ...(prev.borderRadius || { radiusTL: 0, radiusTR: 0, radiusBL: 0, radiusBR: 0 }),
                [corner]: clamped,
            },
        }));
    };

    // Uniform corner update
    const handleUniformRadiusChange = (val: number) => {
        const clamped = Math.max(0, val);
        onUpdateStyle(() => ({
            borderRadius: {
                radiusTL: clamped,
                radiusTR: clamped,
                radiusBL: clamped,
                radiusBR: clamped,
            },
        }));
    };

    // Handle local file uploads
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileUrl = URL.createObjectURL(file);
        onUpdateStyle(() => ({ content: fileUrl }));
    };

    // Helper for current uniform radius value
    const currentUniformRadius = element.borderRadius?.radiusTL ?? 0;

    return (
        <div
            style={{
                top: contolPanelPosition.y!,
                left: contolPanelPosition.x!,
            }}
            onPointerDown={(event) => onPointerDown(event)}
            onPointerMove={(event)=> onSetControlPanelPosition(event)}
            onPointerUp={(event)=> onPointerUp(event)}
            className="absolute w-60 bg-[#2c2c2c] text-[#e5e5e5] border-l border-[#383838] hover:cursor-grab shadow-2xl z-50 flex flex-col font-sans text-[11px] select-none overflow-y-auto"
        >
            <PositionControl element={element} props={{ onUpdateStyle }} />
            <LayoutSection element={element} fileInputRef={fileInputRef} isMediaElement={isMediaElement} props={{ onUpdateStyle }} tagName={tagName} />
            <AppearanceControl currentUniformRadius={currentUniformRadius} element={element} showIndividualRadius={showIndividualRadius} />
            <FillControl element={element} />
            <StrokeControl element={element} />
            <LinkParentControl element={element} />
            <Actions />
        </div>
    );
}

export function Actions() {
    return (
        <div className="mt-auto p-3 flex flex-col gap-2 bg-[#222222]  border-t border-[#383838]">
            <button
                // onClick={() => onDeleteElement?.(id)}
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


export function StrokeControl({ element }: { element: ElementAttr }) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <span className="font-semibold text-[#b3b3b3]">Stroke</span>

            <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded p-1 justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={element.borderColor || "#000000"}
                        // onChange={(e) => onUpdateStyle(() => ({ borderColor: e.target.value }))}
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
                        value={element.borderWidth ?? 0}
                        // onChange={(e) =>
                        //     onUpdateStyle(() => ({ borderWidth: Number(e.target.value) }))
                        // }
                        className="w-8 bg-[#2c2c2c] text-white text-right rounded px-1 border border-[#383838]"
                    />
                    <span className="text-[#808080]">px</span>
                </div>
            </div>

            <select
                value={element.borderStyle || "solid"}
                // onChange={(e) => onUpdateStyle(() => ({ borderStyle: e.target.value }))}
                className="bg-[#1e1e1e] border border-[#383838] text-white rounded p-1 outline-none text-[10px]"
            >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
            </select>
        </div>

    )
}

export function FillControl({ element }: { element: ElementAttr }) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-[#b3b3b3]">Fill</span>
                <label className="flex items-center gap-1 text-[10px] text-[#808080] cursor-pointer">
                    <input
                        type="checkbox"
                        checked={element.useGradient || false}
                        // onChange={(e) => onUpdateStyle(() => ({ useGradient: e.target.checked }))}
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
                            // onChange={(e) => onUpdateStyle(() => ({ backgroundColor: e.target.value }))}
                            className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                        />
                        <span className="uppercase text-white font-mono">
                            {element.backgroundColor || "#FFFFFF"}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-1.5 bg-[#1e1e1e] p-2 rounded border border-[#383838]">
                    <div className="flex items-center justify-between">
                        <span className="text-[#808080] text-[10px]">Start</span>
                        <input
                            type="color"
                            value={element.gradientStart || "#ffffff"}
                            // onChange={(e) => onUpdateStyle(() => ({ gradientStart: e.target.value }))}
                            className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[#808080] text-[10px]">End</span>
                        <input
                            type="color"
                            value={element.gradientEnd || "#000000"}
                            // onChange={(e) => onUpdateStyle(() => ({ gradientEnd: e.target.value }))}
                            className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[#808080] text-[10px]">Angle</span>
                        <input
                            type="number"
                            min={0}
                            max={360}
                            value={element.gradientAngle ?? 90}
                            // onChange={(e) =>
                            //     // onUpdateStyle(() => ({ gradientAngle: Number(e.target.value) }))
                            // }
                            className="w-12 bg-[#2c2c2c] text-white text-right rounded px-1 border border-[#383838]"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
export function LinkParentControl({ element }: { element: ElementAttr }) {
    return (
        <div className="relative p-3 border-b border-[#383838] flex flex-col gap-2.5">

            <div className="flex items-center justify-between">
                <span className="font-semibold text-[#b3b3b3]">Linked to</span>
            </div>

            <div className="flex items-center border border-[#383838] rounded p-1 justify-between">
                <Link />
                <div className="h-10 w-10 bg-red-400">
                </div>
            </div>

            <div className="absolute top-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:cursor-pointer right-2  p-1" > <Trash size={15} /> </div>


        </div>
    )
}

export function AppearanceControl({ currentUniformRadius, showIndividualRadius, element }: { currentUniformRadius: number, showIndividualRadius: boolean, element: ElementAttr }) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <span className="font-semibold text-[#b3b3b3]">Appearance</span>

            {/* Opacity & Radius */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span className="text-[#808080] text-[10px]">Opacity</span>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={100}
                        //   onChange={(e) => {
                        //     const val = Number(e.target.value) / 100;
                        //     onUpdateStyle((prev) => ({
                        //       styles: { ...prev.styles, opacity: val },
                        //     }));
                        //   }}
                        className="bg-transparent w-full outline-none text-white text-right"
                    />
                    <span className="text-[#808080]">%</span>
                </div>

                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span className="text-[#808080] text-[10px]">Radius</span>
                    <input
                        type="number"
                        min={0}
                        value={currentUniformRadius}
                        // onChange={(e) => handleUniformRadiusChange(Number(e.target.value))}
                        className="bg-transparent w-full outline-none text-white text-right"
                    />
                    <button
                        title="Individual Corners"
                        // onClick={() => setShowIndividualRadius((prev) => !prev)}
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
                        <span className="text-[#808080] text-[9px]">TL</span>
                        <input
                            type="number"
                            value={element.borderRadius?.radiusTL ?? 0}
                            // onChange={(e) => handleSingleRadiusChange("radiusTL", Number(e.target.value))}
                            className="bg-[#2c2c2c] w-full text-right text-white rounded px-1 border border-[#383838]"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[#808080] text-[9px]">TR</span>
                        <input
                            type="number"
                            value={element.borderRadius?.radiusTR ?? 0}
                            // onChange={(e) => handleSingleRadiusChange("radiusTR", Number(e.target.value))}
                            className="bg-[#2c2c2c] w-full text-right text-white rounded px-1 border border-[#383838]"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[#808080] text-[9px]">BL</span>
                        <input
                            type="number"
                            value={element.borderRadius?.radiusBL ?? 0}
                            // onChange={(e) => handleSingleRadiusChange("radiusBL", Number(e.target.value))}
                            className="bg-[#2c2c2c] w-full text-right text-white rounded px-1 border border-[#383838]"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[#808080] text-[9px]">BR</span>
                        <input
                            type="number"
                            value={element.borderRadius?.radiusBR ?? 0}
                            // onChange={(e) => handleSingleRadiusChange("radiusBR", Number(e.target.value))}
                            className="bg-[#2c2c2c] w-full text-right text-white rounded px-1 border border-[#383838]"
                        />
                    </div>
                </div>
            )}
        </div>

    )
}


export function PositionControl({ props, element }: { props: Partial<ToolBoxProps>, element: ElementAttr }) {
    const PIXEL_SIZE = 16;
    const removeDefaultInputButton = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">


            <p className="font-light text-[#b3b3b3]">Aligment</p>
            <div className="grid grid-cols-6 gap-0.5 bg-[#1e1e1e] p-1 rounded border border-[#383838]">
                <button
                    title="Align Left"
                    onClick={() => props.onUpdateStyle!(() => ({ position: { ...element.position, x: 0 } }))}
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignStartVertical size={20} />
                </button>
                <button
                    title="Align Horizontal Centers"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignCenterHorizontal size={20} />
                </button>
                <button
                    title="Align Right"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignEndVertical size={20} />
                </button>
                <button
                    title="Align Top"
                    onClick={() => props.onUpdateStyle!(() => ({ position: { ...element.position, y: 0 } }))}
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignStartHorizontal size={20} />
                </button>
                <button
                    title="Align Vertical Centers"
                    className="h-6 flex items-center justify-center hover:bg-[#383838] rounded text-[#b3b3b3] hover:text-white"
                >
                    <AlignCenterHorizontal size={20} />
                </button>
                <button
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
                    <span className="text-[#808080] font-medium w-5 hover:cursor-ew-resize">X</span>
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
                    <span className="text-[#808080] w-5 hover:cursor-ew-resize font-medium">Y</span>
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

            <span className="font-light text-[#b3b3b3]">Rotation</span>

            <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">

                <Angle size={15} className="w-5 hover:cursor-ew-resize" />
                <input
                    type="number"
                    value={Math.round((element.position?.x ?? 0) * PIXEL_SIZE)}
                    onChange={(e) =>
                        props.onUpdateStyle!((prev) => ({
                            position: { ...prev.position, x: Number(e.target.value) / PIXEL_SIZE },
                        }))
                    }
                    className={`bg-transparent w-full outline-none text-white text-right ${removeDefaultInputButton} `}
                />
            </div>

            <div className="bg-yellow-200 w-5" >

            </div>

        </div>
    );
}

type LayoutSectionProps = {
    isMediaElement: boolean
    fileInputRef: React.RefObject<HTMLInputElement | null>
    tagName: string
    element: ElementAttr
    props: Partial<ToolBoxProps>
}


export function LayoutSection({ isMediaElement, fileInputRef, tagName, element, props }: LayoutSectionProps) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-[#b3b3b3]">Layout</span>
                {isMediaElement && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            // onChange={handleFileUpload}
                            accept={
                                tagName === "audio"
                                    ? "audio/*"
                                    : tagName === "video"
                                        ? "video/*"
                                        : "image/*"
                            }
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[10px] bg-[#383838] hover:bg-[#444] text-white px-2 py-0.5 rounded transition-colors"
                        >
                            Upload File
                        </button>
                    </>
                )}
            </div>

            {/* Width / Height Inputs */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span className="text-[#808080] font-medium">W</span>
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
                        className="bg-transparent w-full outline-none text-white text-right"
                    />
                </div>
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <span className="text-[#808080] font-medium">H</span>
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
                        className="bg-transparent w-full outline-none text-white text-right"
                    />
                </div>
            </div>
        </div>
    )
}

