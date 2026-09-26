import { useRef } from "react";
type textSliderProps= {
    text:string, 
    onUpdate: (value:number)=> void
}

export default function TextSlider({ text, onUpdate }:textSliderProps){

    const sliderRef = useRef<HTMLSpanElement>(null);
    const isActive = useRef<Boolean>(false); 
    const lastX = useRef(0);
    const sensitivity = 0.1;

    const handlePointerDown = (e: React.PointerEvent) => {
            isActive.current = true;
            lastX.current = e.clientX;
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
        };
    
        const handlePointerMove = (e: React.PointerEvent) => {
            if (!sliderRef.current || !isActive.current) return;
            const delta = e.clientX - lastX.current;
            lastX.current = e.clientX;
            onUpdate(delta * sensitivity)
        };
    
        const handlePointerUp = (e: React.PointerEvent) => {
            isActive.current = false;
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
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
