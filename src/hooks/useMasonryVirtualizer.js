// src/hooks/useMasonryVirtualizer.js
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo } from "react";

export function useMasonryVirtualizer({
  parentRef,
  items,
  columnCount,
  estimateHeight = 320,
  gap = 16,
}) {
  const columns = useMemo(
    () =>
      Array.from({ length: columnCount }, () => ({
        height: 0,
        items: [],
      })),
    [columnCount]
  );

  items.forEach((item, index) => {
    const shortest = columns.reduce((a, b) => (a.height < b.height ? a : b));
    shortest.items.push({ ...item, index });
    shortest.height += estimateHeight + gap;
  });

  const flatItems = columns.flatMap((col, colIndex) =>
    col.items.map((item) => ({
      ...item,
      column: colIndex,
    }))
  );

  const rowVirtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateHeight,
    overscan: 10,
  });

  return { flatItems, rowVirtualizer };
}
