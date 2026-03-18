import { useEffect, useState, RefObject } from 'react';

export function useCanvasSize(containerRef: RefObject<HTMLDivElement | null>): number {
  const [size, setSize] = useState(600);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const s = Math.min(rect.width, rect.height, 720);
      setSize(Math.floor(s));
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef]);

  return size;
}
