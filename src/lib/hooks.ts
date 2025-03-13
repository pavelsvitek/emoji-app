import { useCallback, useEffect, useRef, useState } from 'react';

export function useDebouncedCallback<T extends (...args: Parameters<T>) => unknown>(
  callback: T,
  delay = 0,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}

export function useToggle(initialState = false) {
  const [state, setState] = useState(initialState);
  const toggle = (forceState?: boolean) => setState((state) => forceState ?? !state);
  const on = () => setState(true);
  const off = () => setState(false);

  return {
    isOpen: state,
    on,
    off,
    toggle,
  };
}

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const toggle = () => setIsLoading((isLoading) => !isLoading);
  const on = () => setIsLoading(true);
  const off = () => setIsLoading(false);

  return {
    isLoading,
    toggle,
    on,
    off,
  };
}
