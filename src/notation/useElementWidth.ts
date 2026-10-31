import type { RefCallback } from 'react';
import { useCallback, useState } from 'react';

/** Tracks the content width of an element with a `ResizeObserver`. */
export function useElementWidth<T extends HTMLElement>(): [RefCallback<T>, number] {
  const [width, setWidth] = useState(0);
  const ref = useCallback((element: T | null) => {
    if (!element) return;
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(() => {
      setWidth(element.clientWidth);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);
  return [ref, width];
}
