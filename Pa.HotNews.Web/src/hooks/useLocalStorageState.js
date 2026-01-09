import { useEffect, useState } from 'react';

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

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
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
