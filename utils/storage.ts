import 'expo-sqlite/localStorage/install';

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const parseCache = new Map<string, { json: string; value: unknown }>();

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const json = localStorage.getItem(key);
    if (!json) return defaultValue;
    const cached = parseCache.get(key);
    if (cached?.json === json) return cached.value as T;
    const value = JSON.parse(json) as T;
    parseCache.set(key, { json, value });
    return value;
  },

  set<T>(key: string, value: T): void {
    const json = JSON.stringify(value);
    localStorage.setItem(key, json);
    parseCache.set(key, { json, value });
    listeners.get(key)?.forEach((fn) => fn());
  },

  subscribe(key: string, listener: Listener): () => void {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);
    return () => listeners.get(key)?.delete(listener);
  },
};
