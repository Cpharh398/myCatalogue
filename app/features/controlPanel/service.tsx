import type { Position } from "~/util/types";
import { getContainerRelativePosition } from "../util";

type HandlersProps = {
    event:React.PointerEvent<HTMLDivElement>, 
    isControlPanelSelected: React.RefObject<boolean>, 
    pointerOffset: React.RefObject<Position>,
    setControlPanelPosition: React.Dispatch<React.SetStateAction<Position>>
}

 export  const HandleControlPanelPointerDown = ({event, isControlPanelSelected, pointerOffset}:HandlersProps)=>{
    
    event.stopPropagation();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    isControlPanelSelected.current = true;
    const rect = target.getBoundingClientRect();

    pointerOffset.current = { 
      x: event.clientX - rect.left, 
      y: event.clientY - rect.top
    };
  }
  
 export const HandleSetControlPanelPosition = ({event, isControlPanelSelected, pointerOffset, setControlPanelPosition}:HandlersProps)=>{

    event.preventDefault();
    if(!isControlPanelSelected.current || !pointerOffset?.current)return;
    
    const referenceDOM = document.getElementById("canvas-container");
    if(!referenceDOM)return;

    const {x, y} = getContainerRelativePosition(referenceDOM, event, pointerOffset);
    setControlPanelPosition(({x:x*16, y:y*16}));
  }
  
  export const HandleControlPanelPointerUp = ({event, isControlPanelSelected, }:Partial<HandlersProps>)=>{
    if(!event || !isControlPanelSelected)return;

    isControlPanelSelected.current = false;
    const target = event.target as HTMLElement;
    target.releasePointerCapture(event.pointerId);
  }

  