import { useRef, useState } from "react"

type Position = {
  x?:number
  y?:number
}

export function Welcome(){

  const [boxPosition, setBoxPosition] = useState<Record<string, Position>>( { "box_1":{x:0, y:0} });
  const selectedTarget = useRef<string | null>(null);
  const pointerOffset = useRef<Position>({x:0, y:0 });

  const HandleMove = (event: React.PointerEvent)=>{

    if(!selectedTarget.current)return;


    const rect = event.currentTarget.getBoundingClientRect();

    const x = (event.clientX - rect.left) - (pointerOffset.current.x ?? 0);
    const y = (event.clientY - rect.top) - (pointerOffset.current.y ?? 0) ;

    const box = selectedTarget.current 
   setBoxPosition(prev => ({...prev,[box]: { x, y } }));
  }

  const HandlePointerDown = (event: React.PointerEvent)=>{

    if(event.target instanceof HTMLElement){

      if(event.target.getAttribute("id") === "container")return;

      const rect = event.target.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      selectedTarget.current = event.target.getAttribute("id"); 
      pointerOffset.current = {x, y};
    }
  }

  const HandlePointerUp = (event: React.PointerEvent)=>{
    selectedTarget.current = null;
    pointerOffset.current = { x:0, y:0};
  }

  return(
    <div 
    id="container"
    onPointerDown={HandlePointerDown} 
    onPointerMove={HandleMove}
    onPointerUp={HandlePointerUp}  className="bg-yellow-400 w-full h-full relative " >

      <div
        id="box_1"
        style={{ top: boxPosition["box_1"].y , left:boxPosition["box_1"].x }}  
        className="bg-amber-600 absolute w-40 aspect-square right-32 " >
        
      </div>

    </div>
  )
}