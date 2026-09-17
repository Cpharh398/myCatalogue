import { Knobs, type BorderRadius, type ElementAttr, type Position } from "~/util/types";
import { findInTree, getContainerRelativePosition, updateNestedElement } from "../util";

type HandlersProps = {
    event:React.PointerEvent<HTMLElement>, 
    isControlPanelSelected: React.RefObject<boolean>, 
    pointerOffset: React.RefObject<Position>,
    setControlPanelPosition: React.Dispatch<React.SetStateAction<Position>>,
    currentSelectedKnob: React.RefObject<Knobs | null>,
    lastSelected: React.RefObject<string | null>,
    elements: Record<string, ElementAttr>,
    setElements: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>
}

    const handleEdgeAlign = ({alignDirection, props}:{alignDirection:string, props: Partial<HandlersProps>}) => {

      props.setElements

        props.setElements!(prev => {
            return updateNestedElement(prev, props.lastSelected?.current!, (el) =>{
                
                    const isChildElement = el.currentStateInTree?.isChildElement;
                    const elementWidth = el.size?.width ?? 0; 
                    const elementHeight = el.size?.height ?? 0;
        
                    let containerWidth = 0;
                    let containerHeight = 0;
        
                    if (isChildElement) {
                        const parentElementID = el.currentStateInTree?.parentElementID ?? "";
                        const parentElement = findInTree(prev, parentElementID);
                        containerWidth = parentElement?.size?.width ?? 0;
                        containerHeight = parentElement?.size?.height ?? 0;
                    } else {
                        const canvasDom = document.getElementById("canvas-container");
                        const pixelWidth = canvasDom?.clientWidth ?? window.innerWidth;
                        const pixelHeight = canvasDom?.clientHeight ?? window.innerHeight;
                        containerWidth = pixelWidth / 16;
                        containerHeight = pixelHeight / 16;
                    }
        
                    return {
                        ...el,
                        position: {
                            ...prev.position,
                            x: alignDirection === "left" ? 0 : alignDirection === "right" ? containerWidth - elementWidth : el.position.x,    
                            y: alignDirection === "top" ? 0 : alignDirection === "bottom" ? containerHeight - elementHeight : el.position.y
                        }
                    };
            })

            

        })

    }

    const handleCenterAlign = ({alignDirection, props}:{alignDirection:string, props: Partial<HandlersProps>}) => { 
        
        props.setElements!((prev) => {
            return updateNestedElement(prev, props.lastSelected?.current!, (el)=>{

                const isChildElement = el.currentStateInTree?.isChildElement;
                const elementWidth = el.size?.width ?? 0; 
                const elementHeight = el.size?.height ?? 0; 
    
                let containerWidth = 0;
                let containerHeight = 0;
    
                if (isChildElement) {
                    const parentElementID = el.currentStateInTree?.parentElementID ?? "";
                    const parentElement = findInTree(prev, parentElementID);
                    containerWidth = parentElement?.size?.width ?? 0;
                    containerHeight = parentElement?.size?.height ?? 0;
                } else {
                    const canvasDom = document.getElementById("canvas-container");
                    const pixelWidth = canvasDom?.clientWidth ?? window.innerWidth;
                    const pixelHeight = canvasDom?.clientHeight ?? window.innerHeight;
                    containerWidth = pixelWidth / 16;
                    containerHeight = pixelHeight / 16;
                }
                const newX = (containerWidth - elementWidth) / 2;
                const newY = (containerHeight - elementHeight) / 2;
    
                return {
                    ...el,
                    position: {
                        ...el.position,
                        x: alignDirection === "horizontal" ? newX : el.position.x,
                        y: alignDirection === "vertical" ? newY : el.position.y
                    }
                };
            });

            })
    }



export const HandleAlignment = ({alignDirection, props}:{alignDirection:string, props:Partial<HandlersProps>}) =>{
   switch (alignDirection) {
        case "left":
        case "right":
        case "top":
        case "bottom":
            handleEdgeAlign({ alignDirection, props })
            break;

        case "horizontal":
        case "vertical":
            handleCenterAlign({ alignDirection, props })
            break;

      }

}

 export const HandleControlPanelPointerDown = ({event, isControlPanelSelected, pointerOffset, currentSelectedKnob, lastSelected, setElements}:HandlersProps)=>{
    
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const button = target.closest("button")
    const alignDirection = button?.dataset?.align;
    
    if(alignDirection){
      HandleAlignment({alignDirection, props:{ lastSelected, setElements } })
      return;
    }

    const currentTarget = event.currentTarget;
    currentTarget.setPointerCapture(event.pointerId);
    isControlPanelSelected.current = true;
    const rect = currentTarget.getBoundingClientRect();

    pointerOffset.current = { 
      x: event.clientX - rect.right, 
      y: event.clientY - rect.top
    };
  }
  
 export const HandlePointerMove = ({event, isControlPanelSelected, pointerOffset, setControlPanelPosition, currentSelectedKnob, lastSelected, elements, setElements }:HandlersProps)=>{

    event.preventDefault();  
    if(!pointerOffset?.current) return;
    
    if(isControlPanelSelected.current){
        const referenceDOM = document.getElementById("canvas-container");
        if(!referenceDOM)return;
    
        const {x, y} = getContainerRelativePosition(referenceDOM, event, pointerOffset, true);
        setControlPanelPosition(({x:x*16*-1, y:y*16}));
    };
  }
  
  export const HandleControlPanelPointerUp = ({event, isControlPanelSelected, currentSelectedKnob }:Partial<HandlersProps>)=>{
    if(!event || !isControlPanelSelected || !currentSelectedKnob )return;

    isControlPanelSelected.current = false;
    const target = event.target as HTMLElement;
    currentSelectedKnob.current = null;

    target.releasePointerCapture(event.pointerId);
  }

  