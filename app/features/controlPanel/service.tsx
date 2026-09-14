import { Knobs, type BorderRadius, type ElementAttr, type Position } from "~/util/types";
import { findInTree, getContainerRelativePosition, updateNestedElement } from "../util";


type HandlersProps = {
    event:React.PointerEvent<HTMLDivElement>, 
    isControlPanelSelected: React.RefObject<boolean>, 
    pointerOffset: React.RefObject<Position>,
    setControlPanelPosition: React.Dispatch<React.SetStateAction<Position>>,
    currentSelectedKnob: React.RefObject<Knobs | null>,
    lastSelected: React.RefObject<string | null>,
    elements: Record<string, ElementAttr>,
    setElements: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>>
}


export const setCurrentSelectedKnob = (controKnob: string | undefined, props: Partial<HandlersProps>) => {
     
    if(!controKnob || !props.currentSelectedKnob || !props.pointerOffset || !props.event) return;
    switch(controKnob){
        case "x" : props.currentSelectedKnob.current = Knobs.xPosittion         
            break;     
        case "y" : props.currentSelectedKnob.current = Knobs.yPosition    
            break;     
        case "h" : props.currentSelectedKnob.current = Knobs.height         
            break;     
        case "w" : props.currentSelectedKnob.current = Knobs.width      
            break;     
        case "r" : props.currentSelectedKnob.current = Knobs.rotation         
            break;
        case "o" : props.currentSelectedKnob.current = Knobs.opacity
            break;
        case "tl" : props.currentSelectedKnob.current = Knobs.radiusTL
            break;
        case "tr" : props.currentSelectedKnob.current = Knobs.radiusTR
            break;
        case "bl" : props.currentSelectedKnob.current = Knobs.radiusBL
            break;
        case "br" : props.currentSelectedKnob.current = Knobs.radiusBR
            break;
        case "ra" : props.currentSelectedKnob.current = Knobs.radiusAll
            break;     
        case "start" : props.currentSelectedKnob.current = Knobs.gradientStartPosition
            break;     
        case "end" : props.currentSelectedKnob.current = Knobs.gradientEndPosition
            break;
        case "angle" : props.currentSelectedKnob.current = Knobs.gradientAngle
            break;
        default:return;   
    }

    props.pointerOffset.current = { 
      x: props.event.clientX, 
      y: 0
    };
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
                        // console.log("element found",findInTree(prev, parentElementID) )
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
    const controKnob = target.dataset.controlknob;
    const button = target.closest("button")
    const alignDirection = button?.dataset?.align;
    
    if(alignDirection){
      HandleAlignment({alignDirection, props:{ lastSelected, setElements } })
      return;
    }
        
    if(controKnob){
        target.setPointerCapture(event.pointerId);
        setCurrentSelectedKnob(controKnob, {currentSelectedKnob, lastSelected, event, pointerOffset});
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

    if(currentSelectedKnob.current){
        updateElementWithControlKnob({ event, lastSelected, elements, currentSelectedKnob, setElements, pointerOffset })
        return;
    }
    
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

  
 export function updateElementWithControlKnob(props: Partial<HandlersProps>) {
     
     if (
         !props.elements ||
         !props.lastSelected?.current ||
         !props.currentSelectedKnob?.current ||
    !props.event ||
    !props.pointerOffset?.current
) {
    return;
}

  const currentX = props.event.clientX;

  const deltaX = currentX - (props.pointerOffset.current.x ?? currentX);

  const sensitivity = 0.5;
  const newX = (deltaX * sensitivity) / 16;
  const updatedValues = getUpdatedValues({ props, newX });

  if (props.setElements) {

    props.setElements((prev) =>{
        
        return updateNestedElement(prev, props.lastSelected!.current!, (updatedEl) => ({
        ...updatedEl,
        position: {
          x: (updatedEl.position?.x ?? 0) + ( updatedValues?.positionUpdate?.x ?? 0),
          y: (updatedEl.position?.y ?? 0) + (updatedValues?.positionUpdate?.y ?? 0),
        },
        size:{
            width: (updatedEl.size?.width ?? 0) + (updatedValues?.widthUpdate?.width ?? 0),
            height: (updatedEl.size?.height ?? 0) + (updatedValues?.heightUpdate?.height ?? 0),
        },
        borderRadius: {
            radiusTL:  Math.max(0, Math.min(100, Number(((updatedEl.borderRadius?.radiusTL ?? 0) + (updatedValues?.borderRadiusUpdate?.radiusTL ?? 0)).toFixed(2)))),
            radiusTR: Math.max(0, Math.min(100, Number(((updatedEl.borderRadius?.radiusTR ?? 0) + (updatedValues?.borderRadiusUpdate?.radiusTR ?? 0)).toFixed(2)))),
            radiusBL: Math.max(0, Math.min(100, Number(((updatedEl.borderRadius?.radiusBL ?? 0) + (updatedValues?.borderRadiusUpdate?.radiusBL ?? 0)).toFixed(2)))),
            radiusBR: Math.max(0, Math.min(100, Number(((updatedEl.borderRadius?.radiusBR ?? 0) + (updatedValues?.borderRadiusUpdate?.radiusBR ?? 0)).toFixed(2)) )) ,
        },
        lgSreenStyle: {
            ...updatedEl.lgSreenStyle,
            opacity: Math.max(0, Math.min(1, Number(((updatedValues?.opacityUpdate?.opacity ?? 0) + Number(updatedEl.lgSreenStyle?.opacity ?? 0)).toFixed(2)) )),
        },
        gradientStartPosition: Math.max(0, Math.min(100, Number(((updatedEl.gradientStartPosition ?? 0) + (updatedValues?.gradientPositionUpdate?.gradientStartPosition ?? 0)).toFixed(2)) )),
        gradientEndPosition: Math.max(0, Math.min(100, Number(((updatedEl.gradientEndPosition ?? 0) + (updatedValues?.gradientPositionUpdate?.gradientEndPosition ?? 0)).toFixed(2)) )),
        gradientAngle: Math.max(0, Math.min(360, Number(( (updatedEl.gradientAngle ?? 0) + Number(updatedValues?.gradientAngleUpdate.gradientAngle ?? 0)).toFixed(2)) )),
      }))}
    );
  }

  props.pointerOffset.current = {
    x: currentX,
    y: 0,
  };
}

export function getUpdatedValues( {props, newX}: { props: Partial<HandlersProps>, newX: number }) {

    let positionUpdate: { x?: number; y?: number } = {};
  let rotationUpdate: { rotation?: number } = {};
  let opacityUpdate: { opacity?: number } = {};
  let widthUpdate: { width?: number } = {};
  let heightUpdate: { height?: number } = {};
  let borderRadiusUpdate: Partial<BorderRadius> = {};
  let gradientPositionUpdate: { gradientStartPosition?: number; gradientEndPosition?: number } = {};
  let gradientAngleUpdate: { gradientAngle?: number } = {};

  switch (props.currentSelectedKnob!.current) {
    case Knobs.xPosittion:
      positionUpdate = { x: newX };
      break;
    case Knobs.yPosition:
        positionUpdate = { y: newX };
        break;
    case Knobs.width:
      widthUpdate = { width: newX };
      break;
    case Knobs.height:
      heightUpdate = { height: newX };
      break;
    case Knobs.rotation:
      rotationUpdate = { rotation: newX };
      break;
    case Knobs.opacity:
      opacityUpdate = { opacity: newX };
      break;
    case Knobs.radiusAll:
        borderRadiusUpdate = { radiusTL: newX, radiusTR: newX, radiusBL: newX, radiusBR: newX };
        break;
    case Knobs.radiusTL:
      borderRadiusUpdate = { radiusTL: newX };
      break;
    case Knobs.radiusTR:
      borderRadiusUpdate = { radiusTR: newX };
      break;
    case Knobs.radiusBL:
      borderRadiusUpdate = { radiusBL: newX };
      break;    
    case Knobs.radiusBR:
      borderRadiusUpdate = { radiusBR: newX };
      break;
    case Knobs.gradientStartPosition:
        gradientPositionUpdate = { gradientStartPosition: newX };
        break;
    case Knobs.gradientEndPosition:
        gradientPositionUpdate = { gradientEndPosition: newX };
        break;
    case Knobs.gradientAngle:
        gradientAngleUpdate = { gradientAngle: newX };
        break;
    default:
      break;
  }


  return { positionUpdate, rotationUpdate, opacityUpdate, widthUpdate, heightUpdate, borderRadiusUpdate, gradientPositionUpdate, gradientAngleUpdate };


}