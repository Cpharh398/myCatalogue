import { useRef, useState } from "react"

type Position = {
  x?: number
  y?: number
}

type Element = {
  position:Position
  raduisTL:number
  raduisTR:number
  raduisBL:number
  raduisBR:number
}

enum Modes {
  normal,
  borderEdit
}

export function Welcome() {

  const [boxPosition, setBoxPosition] = useState<Record<string, Element> | null>(null);
  const selectedMode = useRef<Modes>(Modes.normal);
  const selectedTarget = useRef<string | null>(null);
  const pointerOffset = useRef<Position>({ x: 0, y: 0 });
  const borderEditStartPoint = useRef<Position>({ x: 0, y: 0 });

  const HandleMove = (event: React.PointerEvent) => {

    if (!selectedTarget.current) return;

    if(selectedMode.current === Modes.borderEdit){
      
      const borderRaduisAdjustAmount = event.clientX - borderEditStartPoint.current.x!
      const eventTarget = event.target as HTMLElement;
       const box = selectedTarget.current
       console.log(event.target)

      setBoxPosition(prev => (
        { ...prev, 
          [box]: { 
            raduisBL: prev![box].raduisBL, 
            position:prev![box].position, 
            raduisBR:prev![box].raduisBR, 
            raduisTL:borderRaduisAdjustAmount, 
            raduisTR:prev![box].raduisTR 
          } 
        }
      )
      );
  
    }else{

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) - (pointerOffset.current.x ?? 0);
      const y = (event.clientY - rect.top) - (pointerOffset.current.y ?? 0);  
      const box = selectedTarget.current
      setBoxPosition(prev => (
        { ...prev, 
          [box]: { 
            raduisBL: prev![box].raduisBL, 
            position:{x, y}, 
            raduisBR:prev![box].raduisBR, 
            raduisTL:prev![box].raduisTL, 
            raduisTR:prev![box].raduisTR 
          } 
        }
      )
      );
    }

  }


  const createNewBox = (event: React.PointerEvent) => {
    const boxID = crypto.randomUUID();

    const topPosition = event.clientY;
    const leftPosition = event.clientX;

    setBoxPosition(prev => (
        { ...prev, 
          [boxID]: { 
            raduisBL: 0, 
            position:{ x: leftPosition, y: topPosition}, 
            raduisBR:0, 
            raduisTL:0, 
            raduisTR:0 
          } 
        }
      )
      );
    console.log(boxPosition);

  }


  const HandleBorderEdit = (eventTarget: HTMLElement, event: React.PointerEvent) => {
    selectedMode.current = Modes.borderEdit;
    selectedTarget.current = eventTarget.parentElement!.getAttribute("id");
    borderEditStartPoint.current = { x:event.clientX, y:event.clientY };

    // console.log(eventTarget.dataset.placement);

  }


  const getRelativePosition = (event: React.PointerEvent): Position => {
    const eventTarget = event.target as HTMLElement;
    const rect = eventTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const handleDeafultPointerDownAction = (eventTarget: HTMLElement, event: React.PointerEvent) => {
    const clickedPosition = getRelativePosition(event);
    selectedTarget.current = eventTarget.getAttribute("id");
    pointerOffset.current = { x: clickedPosition.x, y: clickedPosition.y };
  }

  const HandlePointerDown = (event: React.PointerEvent) => {

    if (selectedMode.current === Modes.borderEdit) {
      selectedMode.current = Modes.normal;
      return;
    }

    const eventTarget = event.target as HTMLElement;

    switch (eventTarget.getAttribute("id")) {
      case "container": createNewBox(event)
        break;

      case "boderEdit": HandleBorderEdit(eventTarget, event)
        break;

      default: handleDeafultPointerDownAction(eventTarget, event);
    }
  }


  const HandlePointerUp = (event: React.PointerEvent) => {
    if (selectedMode.current == Modes.normal) {
      selectedTarget.current = null;
      pointerOffset.current = { x: 0, y: 0 };
    }
  }


  return (
    <div
      id="container"
      onPointerDown={HandlePointerDown}
      onPointerMove={HandleMove}
      onPointerUp={HandlePointerUp} className="bg-yellow-400 w-full h-full relative " >
      {
        Object.entries(boxPosition ?? []).map(([id, element]) => <Element br={element.raduisTL} key={id} id={id} left={element.position.x!} top={element.position.y!} />)
      }
    </div>
  )
}

type ElementProps = {
  top: number
  left: number
  br:number
  id: string
};

export function Element(props: ElementProps) {

  const adjustBorderElements: string = "bg-red-600 w-[3%] aspect-square rounded-full absolute hover:cursor-pointer ";

  return (
    <div
      key={props.id}
      id={props.id}
      style={{ top: props.top, left: props.left, borderRadius:props.br }}
      className="bg-amber-600 absolute w-40 aspect-square">

      <div id="boderEdit" data-placement="tl" className={`${adjustBorderElements} top-2.5 left-2.5 `} ></div>
      <div id="boderEdit" data-placement="tr" className={`${adjustBorderElements} top-2.5 right-2.5`} ></div>
      <div id="boderEdit" data-placement="bl" className={`${adjustBorderElements} bottom-2.5 left-2.5`} ></div>
      <div id="boderEdit" data-placement="br" className={`${adjustBorderElements} bottom-2.5 right-2.5`} ></div>

    </div>

  );
};