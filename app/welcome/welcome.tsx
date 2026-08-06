import { useRef, useState } from "react"

type Position = {
  x?: number
  y?: number
}

export function Welcome() {

  const [boxPosition, setBoxPosition] = useState<Record<string, Position>>({ "box_1": { x: 0, y: 0 } });
  const selectedTarget = useRef<string | null>(null);
  const pointerOffset = useRef<Position>({ x: 0, y: 0 });

  const HandleMove = (event: React.PointerEvent) => {

    if (!selectedTarget.current) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = (event.clientX - rect.left) - (pointerOffset.current.x ?? 0);
    const y = (event.clientY - rect.top) - (pointerOffset.current.y ?? 0);
    
    const box = selectedTarget.current
    console.log(boxPosition[box]);
    setBoxPosition(prev => ({ ...prev, [box]: { x, y } }));
  }

  const createNewBox = (event: React.PointerEvent) => {
    const boxID = crypto.randomUUID();

    const topPosition =  event.clientY;
    const leftPosition =  event.clientX;

    const newElement = Element({ top:topPosition, left:leftPosition, id:boxID });
    setBoxPosition(prev => ({ ...prev, [boxID]: { x:leftPosition, y: topPosition } }));

  }

  const HandlePointerDown = (event: React.PointerEvent) => {


    if (event.target instanceof HTMLElement) {

      if (event.target.getAttribute("id") === "container") {
        createNewBox(event);
        return;
      }

      const rect = event.target.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      selectedTarget.current = event.target.getAttribute("id");
      pointerOffset.current = { x, y };
    }
  }

  const HandlePointerUp = (event: React.PointerEvent) => {
    selectedTarget.current = null;
    pointerOffset.current = { x: 0, y: 0 };
  }


  return (
    <div
      id="container"
      onPointerDown={HandlePointerDown}
      onPointerMove={HandleMove}
      onPointerUp={HandlePointerUp} className="bg-yellow-400 w-full h-full relative " >

      <div
        id="box_1"
        style={{ top: boxPosition["box_1"].y, left: boxPosition["box_1"].x }}
        className="bg-amber-600 absolute w-40 aspect-square right-32 " >
      </div>
      {
        Object.entries(boxPosition).map(([ id, position] ) => <Element key={id} id={id} left={position.x!} top={position.y!} /> )
      }

    </div>
  )
}

type ElementProps = {
  top:number
  left:number
  id:string
};

export function Element( props:ElementProps ){
  return(
    <div
      key={props.id}
        id={props.id}
        style={{ top: props.top, left:props.left }}
        className="bg-amber-600 absolute w-40 aspect-square right-32 " >
      </div>

  );
};