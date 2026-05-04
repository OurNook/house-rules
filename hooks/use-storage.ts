import { useCallback, useRef, useSyncExternalStore } from 'react';
import { storage } from '@/utils/storage';

export function useStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const defaultRef = useRef(defaultValue);

  const subscribe = useCallback((cb: () => void) => storage.subscribe(key, cb), [key]);
  const getSnapshot = useCallback(() => storage.get(key, defaultRef.current), [key]);

  const value = useSyncExternalStore(subscribe, getSnapshot);

  const setValue = useCallback((newValue: T) => storage.set(key, newValue), [key]);

  return [value, setValue];
}
