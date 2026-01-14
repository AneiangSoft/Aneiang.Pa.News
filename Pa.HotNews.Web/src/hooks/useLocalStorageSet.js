import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * useLocalStorageSet
 * - 用 localStorage 存储一个 Set（以数组形式持久化）
 * - 返回 [set, { add, remove, has, clear, toArray }]
 */
export function useLocalStorageSet(key, initial = []) {
  const [arr, setArr] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : initial;
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return Array.isArray(initial) ? initial : [];
    }
  });

  const set = useMemo(() => new Set(arr), [arr]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch {
      // ignore
    }
  }, [key, set]);

  const add = useCallback((value) => {
    if (!value) return;
    setArr(prev => {
      if (prev.includes(value)) return prev;
      return [...prev, value];
    });
  }, []);

  const remove = useCallback((value) => {
    if (!value) return;
    setArr(prev => prev.filter(x => x !== value));
  }, []);

  const clear = useCallback(() => setArr([]), []);

  const api = useMemo(() => {
    return {
      add,
      remove,
      clear,
      has: (v) => set.has(v),
      toArray: () => Array.from(set),
    };
  }, [add, remove, clear, set]);

  return [set, api];
}
