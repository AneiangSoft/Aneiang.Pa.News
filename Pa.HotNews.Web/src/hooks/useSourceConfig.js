import { useCallback, useMemo } from 'react';
import { NEWS_UI } from '../config/newsUiConfig';

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

  const setSourceOrder = useCallback(
    (nextOrder) => {
      const normalized = Array.isArray(allSources) ? allSources : [];
      const exists = new Set(normalized.map(s => String(s).toLowerCase()));

      const order = Array.isArray(nextOrder)
        ? nextOrder.map(s => String(s).toLowerCase()).filter(s => exists.has(s))
        : [];

      // 补齐遗漏（比如后端新增来源未出现在拖拽列表里）
      for (const s of normalized.map(x => String(x).toLowerCase())) {
        if (!order.includes(s)) order.push(s);
      }

      setSourceCfg(prev => ({ ...prev, order }));
    },
    [allSources, setSourceCfg]
  );

  const resetSourceCfg = useCallback(() => {
    const normalized = Array.isArray(allSources) ? allSources : [];

    const preferred = NEWS_UI?.sourceManager?.defaultOrder;
    const preferredOrder = Array.isArray(preferred)
      ? preferred.map(s => String(s).toLowerCase())
      : null;

    const exists = new Set(normalized.map(s => String(s).toLowerCase()));

    const order = [];
    if (preferredOrder) {
      for (const s of preferredOrder) {
        if (exists.has(s) && !order.includes(s)) order.push(s);
      }
    }
    for (const s of normalized.map(x => String(x).toLowerCase())) {
      if (!order.includes(s)) order.push(s);
    }

    const defaultHidden = Array.isArray(NEWS_UI?.sourceManager?.defaultHidden)
      ? NEWS_UI.sourceManager.defaultHidden.map(s => String(s).toLowerCase())
      : [];

    const hidden = defaultHidden.filter(s => exists.has(s));

    setSourceCfg({ order, hidden });
  }, [allSources, setSourceCfg]);

  return { hiddenSet, setSourceVisible, moveSource, setSourceOrder, resetSourceCfg };
}
