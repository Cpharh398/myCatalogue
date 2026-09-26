export const CANVAS_GRID_WIDTHS = { desktop: 58, tablet: 46, mobile: 23 } as const;

export function getCanvasScale(container?: HTMLElement | null): number {
  if (typeof document === "undefined") return 16;
  const canvas = container?.closest<HTMLElement>("#canvas-container")
    || document.getElementById("canvas-container");
  const gridWidth = Number(canvas?.dataset.gridWidth) || CANVAS_GRID_WIDTHS.desktop;
  const scale = (canvas?.clientWidth || window.innerWidth) / gridWidth;
  return Number.isFinite(scale) && scale > 0 ? scale : 16;
}

export function getCanvasGridHeight(container?: HTMLElement | null): number {
  if (typeof document === "undefined") return 56;
  const stage = container?.closest<HTMLElement>("#canvas-stage")
    || document.getElementById("canvas-stage");
  const scale = getCanvasScale(container);
  return stage ? Math.max(1, stage.clientHeight / scale) : 56;
}
