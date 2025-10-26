import { useRef, useCallback, useState } from "react";

export function useDragPan<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const [panning, setPanning] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    // не начинаем драг, если нажали на кнопку/ссылку/интерактив
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (["button", "a", "input", "textarea", "select"].includes(tag)) return;

    setPanning(true);
    startX.current = e.clientX;
    startScrollLeft.current = ref.current.scrollLeft;

    window.addEventListener("mousemove", onMouseMove as any);
    window.addEventListener("mouseup", onMouseUp as any);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current || !panning) return;
    const dx = e.clientX - startX.current;
    ref.current.scrollLeft = startScrollLeft.current - dx;
  }, [panning]);

  const onMouseUp = useCallback(() => {
    setPanning(false);
    window.removeEventListener("mousemove", onMouseMove as any);
    window.removeEventListener("mouseup", onMouseUp as any);
  }, [onMouseMove]);

  // колесо мыши по вертикали — крутим по X
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!ref.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      ref.current.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, []);

  return {
    ref,
    bind: {
      onMouseDown,
      onWheel,
      style: { cursor: panning ? "grabbing" as const : "grab" as const },
    },
  };
}
