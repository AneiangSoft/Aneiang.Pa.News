import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

  const saveTimerRef = useRef(null);
  const lastSerializedRef = useRef(null);

  const flush = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    try {
      const serialized = JSON.stringify(Array.from(set));
      if (serialized === lastSerializedRef.current) return;
      lastSerializedRef.current = serialized;
      localStorage.setItem(key, serialized);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // 延迟写入：降低频繁 add/remove 导致的 stringify + setItem 开销
    // 选择 500ms（你选的 C）
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flush, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, set]);

  useEffect(() => {
    const onBeforeUnload = () => flush();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
