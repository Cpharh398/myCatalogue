import type { ElementState, Position } from "~/util/types";
import Modes from "~/util/types";

type pageEditProps = {
    event: React.PointerEvent,
    selectedTarget: React.RefObject<string | null>,
    pointerOffset: React.RefObject<Position>,
    setElements: (value: React.SetStateAction<Record<string, ElementState>>) => void,
    selectedMode: React.RefObject<Modes>,

}

export const updateElementsPosition = ({ event, selectedTarget, pointerOffset, setElements}: Partial<pageEditProps>) => {

    if (!selectedTarget!.current) return;
    const boxId = selectedTarget!.current;

    const container = document.getElementById("canvas-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const x = event!.clientX - rect.left - (pointerOffset!.current.x ?? 0);
    const y = event!.clientY - rect.top - (pointerOffset!.current.y ?? 0);

    setElements!((prev) => ({
        ...prev,
        [boxId]: {
            ...prev[boxId],
            position: { x, y },
            showToolBox: true,
        },
    }));
};


export const handlePointerMove = ({ selectedTarget, selectedMode, event, pointerOffset, setElements }: Partial<pageEditProps>) => {
    if (!selectedTarget!.current) return;

    if (selectedMode!.current === Modes.GRAB) {
        updateElementsPosition({ event, pointerOffset, selectedTarget, setElements });
    }
};


export const createNewBox = ({ event, setElements }: Partial<pageEditProps>) => {
    const boxID = crypto.randomUUID();
    const container = event!.currentTarget.getBoundingClientRect();
    const x = event!.clientX - container.left - 80;
    const y = event!.clientY - container.top - 80;

    setElements!((prev) => ({
        ...prev,
        ...Object.keys(prev).reduce((acc, key) => {
            acc[key] = { ...prev[key], showToolBox: false };
            return acc;
        }, {} as Record<string, ElementState>),
        [boxID]: {
            showToolBox: true,
            position: { x, y },
            borderRadius: { radiusBL: 0, radiusBR: 0, radiusTL: 0, radiusTR: 0 },
            borderColor: "#3b82f6",
            borderWidth: 2,
            borderStyle: "solid",
            backgroundColor: "#f59e0b",
            useGradient: false,
            gradientStart: "#ec4899",
            gradientEnd: "#8b5cf6",
            gradientAngle: 135,
        },
    }));
};


export const handlePointerDownContainer = ({ event, setElements, selectedMode, selectedTarget, pointerOffset }: Partial<pageEditProps>) => {
    const target = event!.target as HTMLElement;

    if (target.id === "canvas-container") {
        createNewBox({ event, setElements });
        return;
    }

    const elementNode = target.closest("[data-element-id]");
    if (!elementNode) return;

    const boxId = elementNode.getAttribute("data-element-id")!;

    selectedMode!.current = Modes.GRAB;
    selectedTarget!.current = boxId;

    const rect = elementNode.getBoundingClientRect();
    pointerOffset!.current = {
        x: event!.clientX - rect.left,
        y: event!.clientY - rect.top,
    };

    setElements!((prev) => {
        const nextState: Record<string, ElementState> = {};
        Object.keys(prev).forEach((id) => {
            nextState[id] = {
                ...prev[id],
                showToolBox: id === boxId,
            };
        });
        return nextState;
    });
};


export const handlePointerUp = ({ selectedMode, selectedTarget }: Partial<pageEditProps>) => {
    selectedMode!.current = Modes.GRAB;
    selectedTarget!.current = null;
};

export const updateElementStyle = (id: string, updater: (prev: ElementState) => Partial<ElementState>, setElements: (value: React.SetStateAction<Record<string, ElementState>>) => void) => {

    setElements!((prev) => ({
        ...prev,
        [id]: {
            ...prev[id],
            ...updater(prev[id]),
        },
    }));

};