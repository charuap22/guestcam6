import { useRef } from "react";

export default function useLongPress(onLongPress, delay = 350) {
  const timeoutRef = useRef(null);

  const start = () => {
    timeoutRef.current = setTimeout(onLongPress, delay);
  };

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: clear,
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
  };
}
