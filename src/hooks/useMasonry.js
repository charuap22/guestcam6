import { useEffect, useMemo, useRef, useState } from "react";

export function useMasonry({ items = [], columnWidth = 260, gap = 16 }) {
  const parentRef = useRef(null);
  const rafId = useRef(null);
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    if (!parentRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        const width = entry.contentRect.width;

        const cols = Math.max(
          1,
          Math.floor((width + gap) / (columnWidth + gap))
        );

        setColumnCount((prev) => (prev === cols ? prev : cols));
      });
    });

    observer.observe(parentRef.current);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, [columnWidth, gap]);

  const columnedItems = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    items.forEach((item, index) => {
      cols[index % columnCount].push(item);
    });
    return cols;
  }, [items, columnCount]);

  return { parentRef, columnedItems };
}
