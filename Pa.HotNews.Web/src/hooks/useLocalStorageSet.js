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

  const MAX_SIZE = 5000;

  const add = useCallback((value) => {
    if (!value) return;
    setArr(prev => {
      // 用 Set 判断，避免已读条目变多后 prev.includes O(n) 带来卡顿
      const prevSet = new Set(prev);
      if (prevSet.has(value)) return prev;

      // 追加到末尾：保持“先读先存”的顺序（便于上限淘汰策略：丢最旧的）
      let next = [...prev, value];

      // 上限：最多保留最近 MAX_SIZE 条
      if (next.length > MAX_SIZE) {
        next = next.slice(next.length - MAX_SIZE);
      }

      return next;
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
