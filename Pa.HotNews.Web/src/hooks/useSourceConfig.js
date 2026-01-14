import { useCallback, useMemo } from 'react';

export function useSourceConfig({ allSources, sourceCfg, setSourceCfg }) {
  const hiddenSet = useMemo(() => new Set(sourceCfg?.hidden || []), [sourceCfg?.hidden]);

  const setSourceVisible = useCallback(
    (src, visible) => {
      const key = String(src).toLowerCase();
      setSourceCfg(prev => {
        const hidden = new Set(prev?.hidden || []);
        if (visible) hidden.delete(key);
        else hidden.add(key);
        return { ...prev, hidden: Array.from(hidden) };
      });
    },
    [setSourceCfg]
  );

  const moveSource = useCallback(
    (src, dir) => {
      const key = String(src).toLowerCase();
      setSourceCfg(prev => {
        const order = Array.isArray(prev?.order) ? [...prev.order] : [];
        const idx = order.indexOf(key);
        if (idx < 0) return prev;
        const nextIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (nextIdx < 0 || nextIdx >= order.length) return prev;
        const tmp = order[idx];
        order[idx] = order[nextIdx];
        order[nextIdx] = tmp;
        return { ...prev, order };
      });
    },
    [setSourceCfg]
  );

  const resetSourceCfg = useCallback(() => {
    const normalized = Array.isArray(allSources) ? allSources : [];
    setSourceCfg({ order: normalized, hidden: [] });
  }, [allSources, setSourceCfg]);

  return { hiddenSet, setSourceVisible, moveSource, resetSourceCfg };
}
