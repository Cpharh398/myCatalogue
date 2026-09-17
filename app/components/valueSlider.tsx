import { useRef } from "react";
type textSliderProps= {
    text:string, 
    onUpdate: (value:number)=> void
}

export default function TextSlider({ text, onUpdate }:textSliderProps){

    const sliderRef = useRef<HTMLSpanElement>(null);
    const isActive = useRef<Boolean>(false); 
    const sensitivity = 0.5;

    const handlePointerDown = (e: React.PointerEvent) => {
            isActive.current = true;
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
        };
    
        const handlePointerMove = (e: React.PointerEvent) => {
            if (!sliderRef.current || !isActive.current) return;
            const rect = sliderRef.current.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const value = (relativeX * sensitivity) / 16;
            onUpdate(value)
        };
    
        const handlePointerUp = (e: React.PointerEvent) => {
            isActive.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
            
    return(
        <span 
        ref={sliderRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="text-[#808080] w-full hover:cursor-ew-resize">{text}</span>
    )
}