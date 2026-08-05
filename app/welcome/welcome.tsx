import { useEffect, useRef, useState } from "react"


type MapProps = {
  x?:number
  y?:number
}

function filterPositionFromStyle(style:string | null): MapProps{
  if(!style)return {x:0, y:0};
  let location:MapProps | null = {};

  style.split(";").map(item => {
    
    if(item){
        if(item.includes("row")){
          location.y = parseInt(item.split(":")[1]);  
        }
        else{
          location.x = parseInt(item.split(":")[1]);  
        }
    }
  
  });


  return location;

}

export function Welcome() {

  const [children, setChildren] = useState<MapProps[]>([]);
  let dragOverPosition = useRef<EventTarget | null>(null); 
  const [selectedElement, setSelectedElement] = useState<EventTarget | null>(null);


  const [boxPosition, setBoxPosition] = useState<MapProps>({ x:10, y:10 });

  
  const addChildren = ()=>{
    let cells: MapProps[] = [];  

    for(let y = 1; y < 60; y++){
      for(let x = 1; x < 60; x++){
        cells.push({ x, y });
      }
    }

    setChildren(cells);
  }

  const continerRef = useRef(null);

  useEffect(()=>{
    addChildren();
  }, [])

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) =>{


    event.preventDefault();

    let newPosition:MapProps = {};

    if (dragOverPosition.current instanceof HTMLElement) {
      newPosition = filterPositionFromStyle(dragOverPosition.current.getAttribute("style"));   
   }
    
   
    if(event.target instanceof HTMLElement) {
      console.log(newPosition);
      setBoxPosition({ x: newPosition.x, y: newPosition.y })
      
    }

  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) =>{
    event.preventDefault();
    dragOverPosition.current = event.target;
  }


  return(
    <div onDragEnd={handleDragEnd} onDragOver={handleDragOver}  ref={continerRef} className="bg-amber-300 w-full h-full box" >
      {
        children.map(child => <div key={`${child.x} ${child.y}`} style={{ gridColumnStart:child.x, gridRowStart:child.y }}></div>   )
      }

      <div draggable="true" style={{ gridColumnStart:boxPosition.x, gridRowStart: boxPosition.y  }} className="bg-yellow-900 col-span-3 row-span-3" >

      </div>
    
    </div>
  )
}