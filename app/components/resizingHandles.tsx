export function ResizingHandles({ isVisible }:{ isVisible:boolean | undefined } ) {

  const cornerHandleStyle =
    "w-3 h-3 bg-white border-[2px] border-blue-600 rounded-full shadow-sm transition-transform hover:scale-125 z-30";

  const edgeHandleStyle =
    "bg-white border-[1.5px] border-blue-600 rounded-full shadow-sm transition-transform hover:scale-125 z-30";

  const resizePoints = [

    { point: "tl", style: `${cornerHandleStyle} -top-[1.1rem] -left-[1.1rem] cursor-nwse-resize` },
    { point: "tr", style: `${cornerHandleStyle} -top-[1.1rem] -right-[1.1rem] cursor-nesw-resize` },
    { point: "bl", style: `${cornerHandleStyle} -bottom-[1.1rem] -left-[1.1rem] cursor-nesw-resize` },
    { point: "br", style: `${cornerHandleStyle} -bottom-[1.1rem] -right-[1.1rem] cursor-nwse-resize` },

    {
      point: "top",
      style: `${edgeHandleStyle} -top-[1.1rem] left-1/2 -translate-x-1/2 w-5 h-2 cursor-ns-resize`,
    },
    {
      point: "bottom",
      style: `${edgeHandleStyle} -bottom-[1.1rem] left-1/2 -translate-x-1/2 w-5 h-2 cursor-ns-resize`,
    },
    {
      point: "left",
      style: `${edgeHandleStyle} -left-[1.1rem] top-1/2 -translate-y-1/2 w-2 h-5 cursor-ew-resize`,
    },
    {
      point: "right",
      style: `${edgeHandleStyle} -right-[1.1rem] top-1/2 -translate-y-1/2 w-2 h-5 cursor-ew-resize`,
    },
  ];

  if(!isVisible)return;

  return (
    <>
      <div className={`absolute -inset-3.5  ${ isVisible ? "pointer-events-auto": "pointer-events-none" }  border-[1.5px] border-blue-600 pointer-events-none z-10`} />

      {resizePoints.map((point) => (
        <div
          key={point.point}
          data-resizepoint={point.point}
          className={`absolute ${point.style}`}
        />
      ))}
    </>
  );
}
