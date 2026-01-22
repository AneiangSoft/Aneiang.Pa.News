import { useEffect, useRef, useState } from 'react';

/**
 * useLocalStorageState
 * - 支持 lazy init
 * - 支持跨 tab 同步（storage 事件）
 */
export function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) {
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      }
      return JSON.parse(raw);
    } catch {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  });

  const saveTimerRef = useRef(null);
  const lastSerializedRef = useRef(null);

  const flush = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    try {
      const serialized = JSON.stringify(state);
      if (serialized === lastSerializedRef.current) return;
      lastSerializedRef.current = serialized;
      localStorage.setItem(key, serialized);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // 延迟写入：降低频繁 setState 导致的 stringify + setItem 开销
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
  }, [key, state]);

  useEffect(() => {
    const onBeforeUnload = () => flush();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, state]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key) return;
      try {
        const next = e.newValue == null ? null : JSON.parse(e.newValue);
        setState(next);
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [state, setState];
}
