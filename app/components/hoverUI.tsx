import { CurrentState } from "~/util/types";

interface HoveredOverlayProps {
  currentState?: CurrentState;
  label?: string;
}

export const HoveredElementHighlight: React.FC<HoveredOverlayProps> = ({
  currentState,
  label = "Drop here",
}) => {

  if (currentState !== CurrentState.HOVERED) return null;

  return (
    <div
      className = "absolute inset-0 pointer-events-none rounded border-2 border-dashed border-blue-500 bg-blue-500/10 z-50 flex items-center justify-center transition-all duration-150"
      style={{
        boxShadow: "0 0 12px rgba(59, 130, 246, 0.4)",
      }}
    >
      <span className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};