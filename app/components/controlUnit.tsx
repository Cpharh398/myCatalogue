import React, { useState, useRef, type SetStateAction } from "react";
import { findInTree, removeElementFromTree, updateNestedElement } from "~/features/util";
import type { BorderRadius, CurrentState, ElementAttr, Position } from "~/util/types";
import { Link, Trash } from "lucide-react"
import { AlignStartVertical, AlignEndVertical, AlignCenterHorizontal, AlignStartHorizontal, AlignCenterVertical, AlignEndHorizontal, Angle } from "lucide-react"
import { ParentElementPreview } from "./elementPreview";
import { AppearanceControl } from "./Apperance";
import { removeDefaultInputButton } from "~/features/pageEditing/constants";
import { NumberInput } from "./numberInput";
import { ColorPicker } from "antd";
import TextSlider from "./valueSlider";

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
    onUpdateMinimized,

}: ToolBoxProps) {

    if (!currentElement) return null;

    const element = findInTree(elements, currentElement);
    if (!element) return null;
     const tag = (element.elementTag || "div").toLowerCase();


    const isTextElement = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a","text"].includes(tag);
    const isButtonElement = ["button"].includes(tag) 
    const isImageElement = ["img", "image"].includes(tag);
    const isDivElement = ["div"].includes(tag);
    const isVideoElement = ["video"].includes(tag);
    const isAudioElement = ["audio"].includes(tag);
    const isMediaElement = isImageElement || isVideoElement || isAudioElement;


    const [showIndividualRadius, setShowIndividualRadius] = useState<boolean>(false);
    const [isAppearanceExpanded, setIsAppearanceExpanded] = useState(false);
    const appearanceRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });

    // Helper for current uniform radius value
    const currentUniformRadius = (
        (element.borderRadius?.radiusTL ?? 0) +
        (element.borderRadius?.radiusTR ?? 0) +
        (element.borderRadius?.radiusBL ?? 0) +
        (element.borderRadius?.radiusBR ?? 0)) / 4;


    const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
        isDraggingRef.current = false;
        startPosRef.current = { x: event.clientX, y: event.clientY };

        (event.target as HTMLElement).setPointerCapture(event.pointerId);

        onPointerDown(event);
    };

    const handleToggleAppearance = () => {
        const nextState = !isAppearanceExpanded;
        setIsAppearanceExpanded(nextState);

        if (nextState) {
            // Wait for render/expansion before scrolling
            setTimeout(() => {
                appearanceRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 50);
        }
    };

    const updateProp = (
        key: keyof ElementAttr,
        value: ElementAttr[keyof ElementAttr],
        updateFromPrev?: boolean,
        min?: number
    ) => {
        onUpdateStyle!((prev) =>
            updateNestedElement(prev, currentElement!, (el) => {
                const previousValue = el[key];

                // 1. DIRECT ASSIGNMENT (Fast path when not updating relative values)
                if (!updateFromPrev) {
                    // If updating an object (e.g. style or borderRadius), merge properties directly
                    if (
                        previousValue &&
                        typeof previousValue === "object" &&
                        value &&
                        typeof value === "object" &&
                        !Array.isArray(value)
                    ) {
                        return {
                            ...el,
                            [key]: { ...previousValue, ...value },
                        };
                    }

                    return {
                        ...el,
                        [key]: value,
                    };
                }

                // 2. RELATIVE OBJECT ADDITION (Zero-allocation for...in loop)
                if (
                    previousValue &&
                    typeof previousValue === "object" &&
                    value &&
                    typeof value === "object" &&
                    !Array.isArray(value)
                ) {
                    const result: Record<string, any> = { ...previousValue };
                    const deltaObj = value as Record<string, any>;

                    for (const prop in deltaObj) {
                        const delta = deltaObj[prop];
                        const prevNum = result[prop];

                        if (typeof delta === "number" && typeof prevNum === "number") {
                            result[prop] = min !== undefined ? Math.max((prevNum + delta), min) : (prevNum + delta);
                        } else if (delta !== undefined) {
                            result[prop] = delta;
                        }
                    }

                    return {
                        ...el,
                        [key]: result,
                    };
                }

                // 3. RELATIVE NUMERIC ADDITION
                if (typeof previousValue === "number" && typeof value === "number") {
                    return {
                        ...el,
                        [key]: previousValue + value,
                    };
                }

                // 4. FALLBACK
                return {
                    ...el,
                    [key]: value,
                };
            })
        );
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {

        // Only process if the primary mouse/touch button is active
        if (event.buttons === 0) return;

        // 2. Calculate distance moved from initial click position
        const deltaX = Math.abs(event.clientX - startPosRef.current.x);
        const deltaY = Math.abs(event.clientY - startPosRef.current.y);

        // If moved more than 5px, mark as a drag operation
        if (deltaX > 5 || deltaY > 5) {
            isDraggingRef.current = true;
        }

        if (isDraggingRef.current) {
            onSetControlPanelPosition(event);
        }
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
        onPointerUp(event);
    };

    const handleClick = (event: React.MouseEvent) => {
        // 3. Prevent click toggle if a drag occurred
        if (isDraggingRef.current) {
            event.stopPropagation();
            return;
        }
        onUpdateMinimized(true);
    };


    if (!iscontrolPanelVisible) {
        return (
            <button
                type="button"
                style={{
                    top: contolPanelPosition.y!,
                    right: contolPanelPosition.x!,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={handleClick}
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
            className="absolute w-60 h-150 bg-[#2c2c2c] text-[#e5e5e5] border border-[#383838] rounded-lg hover:cursor-grab shadow-2xl z-50 flex flex-col font-sans text-[11px] select-none "
        >
            {/* Fixed Header */}
            <Header onUpdateMinimized={onUpdateMinimized} />

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-x-visible overflow-y-auto flex flex-col divide-y divide-[#383838]">
                <MediaAndTextInspector element={element} currentElement={currentElement} updateProp={updateProp} />
                <PositionControl updateProp={updateProp} element={element} />
                <LayoutSection element={element} updateProp={updateProp} />

                {/* COLLAPSIBLE APPEARANCE SECTION */}
                <div ref={appearanceRef} className="flex flex-col bg-[#242424]">
                    {/* Expand/Collapse Toggle Button */}
                    <button
                        type="button"
                        onClick={handleToggleAppearance}
                        className="w-full px-3 py-2 flex items-center justify-between bg-[#2c2c2c] hover:bg-[#333333] text-white font-semibold transition-colors border-b border-[#383838]"
                    >
                        <span className="text-[10px] uppercase tracking-wider text-[#a0a0a0]">Appearance</span>
                        <svg
                            className={`w-3.5 h-3.5 text-[#808080] transition-transform duration-200 ${isAppearanceExpanded ? "rotate-180 text-white" : ""
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Expandable Appearance Content */}
                    {isAppearanceExpanded && (
                        <div className="p-2">
                            <AppearanceControl
                                currentElement={currentElement}
                                setShowIndividualRadius={setShowIndividualRadius}
                                currentUniformRadius={currentUniformRadius}
                                element={element}
                                showIndividualRadius={showIndividualRadius}
                                updateProp={updateProp}
                            />
                        </div>
                    )}
                </div>

                {
                    (isDivElement || isButtonElement) &&<>
                        <FillControl element={element} currentElement={currentElement} onUpdateStyle={onUpdateStyle} updateProp={updateProp} />
                        <StrokeControl element={element} updateProp={updateProp} />
                    </>
                }

                <LinkParentControl element={element} props={{ onDelinkElement, elements }} />
                <Actions onDeleteElement={onDeleteElement} />
            </div>
        </div>
    );
}


export function Header({ onUpdateMinimized }: { onUpdateMinimized: (value: Boolean) => void }) {
    return (
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
                className="p-1 flex items-center justify-center rounded-4xl text-[#808080] hover:text-white hover:bg-[#383838] transition-colors "

            >
                {/* Minimize Icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    )

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


export function StrokeControl({ element, updateProp }: { element: ElementAttr, updateProp: (key: keyof ElementAttr, value: ElementAttr[keyof ElementAttr], updateFromPrev?: boolean) => void }) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <span className="font-semibold text-[#b3b3b3]">Stroke</span>

            <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded p-1 justify-between">
                <div className="flex items-center gap-2">
                    <ColorPicker
                        value={element.borderColor}
                        size="small"
                        onChangeComplete={(value) => updateProp("borderColor", value.toRgbString())}
                    />

                    <span className="uppercase text-white font-mono">
                        {element.borderColor || "#000000"}
                    </span>
                </div>

                <div
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex items-center gap-1">

                    <NumberInput
                        min={0}
                        max={10}
                        value={element.borderWidth ?? 0}
                        onChange={(value) => updateProp("borderWidth", Number(value))}
                        className="w-11 bg-[#2c2c2c] text-white text-right rounded px-1 border border-[#383838]"
                    />

                    <span className="text-[#808080]">px</span>
                </div>
            </div>
            <select
                value={element.borderStyle || "solid"}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => updateProp("borderStyle", e.target.value)}
                className="bg-[#1e1e1e] border border-[#383838] text-white rounded p-1 outline-none text-[10px]"
            >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
            </select>
        </div>

    )
}

export function FillControl({ element, onUpdateStyle, currentElement, updateProp }: { element: ElementAttr; onUpdateStyle: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>, currentElement: string, updateProp: (key: keyof ElementAttr, value: ElementAttr[keyof ElementAttr], updateFromPrev?: boolean) => void }) {
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">

                <span className="font-semibold text-[#b3b3b3]">Fill</span>
                <label className="flex items-center gap-1 text-[10px] text-[#808080] cursor-pointer">
                    <input
                        type="checkbox"
                        checked={element.useGradient || false}
                        onChange={(e) => updateProp("useGradient", e.target.checked)

                        }
                        className="accent-[#0c8ce9]"
                    />
                    Gradient
                </label>
            </div>

            {!element.useGradient ? (
                <div
                    onPointerDown={e => e.stopPropagation()}
                    onPointerMove={e => e.stopPropagation()}
                    className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded p-1.5 justify-between">
                    <div className="flex items-center gap-2 w-full">
                        {/* 1. CUSTOM HSLA COLOR PICKER BUTTON */}

                        <ColorPicker
                            size="small"
                            value={element.backgroundColor}
                            onChangeComplete={(cssColor) => updateProp("backgroundColor", cssColor.toRgbString())}
                        />
                        {/* 2. EDITABLE COLOR TEXT FIELD */}
                        <p className="w-full bg-transparent text-white font-mono text-[10px] outline-none border-none focus:ring-0 uppercase" >{element.backgroundColor}</p>

                    </div>
                </div>
            ) : (
                <GradientControls
                    currentElement={currentElement}
                    element={element}
                    // onUpdateStyle={onUpdateStyle}
                    updateProp={updateProp}
                />
            )}
        </div>
    )
}




type GradientControlsProps = {
    element: ElementAttr,
    currentElement: string
    updateProp: (key: keyof ElementAttr, value: any) => void
    // onUpdateStyle: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
};
export function GradientControls({ element, currentElement, updateProp }: GradientControlsProps) {
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

        updateProp(activeHandle === "start" ? "gradientStartPosition" : "gradientEndPosition", percentage)
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (activeHandle) {
            e.currentTarget.releasePointerCapture(e.pointerId);
            setActiveHandle(null);
        }
    };

    return (
        <div
            onPointerDown={e => e.stopPropagation()}
            onPointerMove={e => e.stopPropagation()}
            className="flex flex-col gap-2.5 bg-[#1e1e1e] p-2.5 rounded border border-[#383838] text-[10px]">
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
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md hover:cursor-pointer cursor-grab active:cursor-grabbing z-10"
                        style={{ left: `${startPos}%`, backgroundColor: startColor }}
                    />

                    {/* End Handle */}
                    <div
                        onPointerDown={handlePointerDown("end")}
                        onPointerUp={handlePointerUp}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white hover:cursor-pointer shadow-md cursor-grab active:cursor-grabbing z-10"
                        style={{ left: `${endPos}%`, backgroundColor: endColor }}
                    />
                </div>
            </div>

            {/* 2. HSLA COLOR PICKERS & ANGLE CONTROL */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-[#2c2c2c]">
                <div className="flex items-center justify-around">
                    {/* Custom HSLA Start Color Picker */}

                    <ColorPicker
                        value={startColor}
                        onChangeComplete={(cssColor) => updateProp("gradientStart", cssColor.toRgbString())

                        }
                    />

                    <ColorPicker
                        value={endColor}
                        onChangeComplete={(cssColor) => updateProp("gradientEnd", cssColor.toRgbString())

                        }
                    />
                </div>

                {/* Angle Input */}
                <div
                    className="flex items-center justify-between bg-[#2c2c2c] hover:cursor-ew-resize px-2 py-1 rounded border border-[#383838]">
                    <span data-controlknob="angle" className="text-[#808080] text-[9px]">Angle</span>
                    <div className="flex items-center gap-0.5">
                        <NumberInput
                            min={0}
                            max={360}
                            value={angle}
                            onChange={(value) => updateProp("gradientAngle", Math.max(0, Math.min(Number(value), 360)))

                            }
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



export function PositionControl({ element, updateProp }: { element: ElementAttr, updateProp: (key: keyof ElementAttr, value: any, updateFromPrev?: boolean, min?: number) => void }) {

    const PIXEL_SIZE = 16;
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <p className="font-light text-[#b3b3b3]">Aligment</p>
            <div className="grid grid-cols-6 gap-0.5 bg-[#1e1e1e] p-1 rounded border border-[#383838]">
                <button
                    data-align="left"
                    title="Align Left"
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
                    <TextSlider text="X" onUpdate={(value) => updateProp("position", { x: value / PIXEL_SIZE }, true,)} />

                    {/* <span data-controlknob="x" className="text-[#808080]  w-full hover:cursor-ew-resize">X</span> */}
                    <NumberInput
                        value={Math.round((element.position?.x ?? 0) * PIXEL_SIZE)}
                        onChange={(value) => updateProp("position", { x: value / PIXEL_SIZE })}
                        hideUpDownArrow={true}
                    />

                </div>
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    <TextSlider text="Y" onUpdate={(value) => updateProp("position", { y: value / PIXEL_SIZE }, true)} />
                    {/* <span data-controlknob="y" className="text-[#808080] w-20 hover:cursor-ew-resize font-medium">Y</span> */}
                    <NumberInput
                        value={Math.round((element.position?.y ?? 0) * PIXEL_SIZE)}
                        hideUpDownArrow={true}
                        onChange={(value) => updateProp("position", { y: value / PIXEL_SIZE })}
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
    updateProp: (key: keyof ElementAttr, value: ElementAttr[keyof ElementAttr], updateFromPrev?: boolean, min?: number) => void
}


export function LayoutSection({ element, updateProp }: LayoutSectionProps) {
    const PIXEL_SIZE = 16;
    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-[#b3b3b3]">Layout</span>
            </div>

            {/* Width / Height Inputs */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    {/* <span data-controlknob="w" className={`text-[#808080] hover:cursor-ew-resize w-20 font-medium`}>W</span> */}
                    <TextSlider text="W" onUpdate={(value) => updateProp("size", { width: value / 16 }, true, 0.1)} />

                    <NumberInput
                        value={Math.round((element.size?.width ?? 1) * 16)}
                        hideUpDownArrow={true}
                        onChange={(value) => updateProp("size", { width: Math.max(Number(value) / 16, 2) })
                        }
                    />

                </div>
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 gap-1 focus-within:border-[#0c8ce9]">
                    {/* <span data-controlknob="h" className="text-[#808080] w-20 hover:cursor-ew-resize font-medium">H</span> */}
                    <TextSlider text="H" onUpdate={(value) => updateProp("size", { height: value / 16 }, true, 0.1)} />


                    <NumberInput
                        value={Math.round((element.size?.height ?? 1) * 16)}
                        hideUpDownArrow={true}
                        onChange={(value) => updateProp("size", { height: Math.max(Number(value) / 16, 2) })

                        }
                    />

                </div>
            </div>
        </div>
    )
}



type ContentInspectorProps = {
    element: ElementAttr;
    currentElement: string
    // onUpdateStyle: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>;
    updateProp: (key: keyof ElementAttr, value: any, updateFromPrev?: boolean) => void
};

export function MediaAndTextInspector({ element, currentElement, updateProp }: ContentInspectorProps) {
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
        updateProp("content", fileUrl)
    };

    return (
        <div className="p-3 border-b border-[#383838] flex flex-col gap-2.5 font-sans text-[11px]">

            {/* ---------------- 1. TEXT INPUT CONTROL ---------------- */}
            {isTextElement && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-[#808080] text-[10px]">Text Content</label>
                    <textarea
                        rows={3}
                        value={element.content || ""}
                        onChange={e => {
                            e.stopPropagation()
                            updateProp("content", e.target.value)

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
                    <div className="relative w-full min-h-25 max-h-40 bg-[#1e1e1e] border border-[#383838] rounded flex items-center justify-center overflow-hidden group">
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
                </div>
            )}
        </div>
    );
}
