import { useCallback, useMemo, useState } from 'react';

export function useReader({ linkBehavior, noIframeSources, query, newsBySource }) {
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerItem, setReaderItem] = useState(null); // { url, title, source }
  const [readerKey, setReaderKey] = useState(0);
  const [readerEmbedBlocked, setReaderEmbedBlocked] = useState(false);
  const [readerHeaderLoading, setReaderHeaderLoading] = useState(false);

  // 最近阅读（最多 20 条）
  const [readerHistory, setReaderHistory] = useState([]);

  const pushReaderHistory = useCallback(({ url, title, source }) => {
    if (!url) return;
    const src = String(source || '').toLowerCase();
    setReaderHistory(prev => {
      const next = [
        { url, title: title || '', source: src, ts: Date.now() },
        ...(prev || []).filter(x => x?.url && x.url !== url),
      ];
      return next.slice(0, 20);
    });
  }, []);

  const computeReaderNeighbors = useCallback(
    ({ url, source }) => {
      const src = String(source || '').toLowerCase();
      if (!url || !src) return { prevItem: null, nextItem: null };

      const q = (query || '').trim().toLowerCase();
      const listRaw = newsBySource?.[src]?.list || [];
      const list = q
        ? listRaw.filter(n => (n?.title || '').toLowerCase().includes(q))
        : listRaw;

      const idx = list.findIndex(x => x?.url === url);
      if (idx < 0) return { prevItem: null, nextItem: null };

      const prev = idx > 0 ? list[idx - 1] : null;
      const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

      return {
        prevItem: prev ? { url: prev.url, title: prev.title, source: src } : null,
        nextItem: next ? { url: next.url, title: next.title, source: src } : null,
      };
    },
    [newsBySource, query]
  );

  const openReaderFromItem = useCallback(
    ({ url, title, source }) => {
      if (!url) return;

      // 移动端强制“新标签页打开”，避免站内阅读在手机上的体验问题
      if (typeof window !== 'undefined') {
        const isMobileByViewport = window.matchMedia && window.matchMedia('(max-width: 991.98px)').matches;
        const isMobileByUA = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
        const isMobile = isMobileByViewport || isMobileByUA;
        if (isMobile) {
          window.open(url, '_blank', 'noopener,noreferrer');
          return;
        }
      }

      // 用户选择“新标签页打开”则直接外跳
      if (linkBehavior === 'new-tab') {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      const src = String(source || '').toLowerCase();
      const degraded = noIframeSources?.has(src);

      setReaderEmbedBlocked(!!degraded);
      setReaderHeaderLoading(!degraded);
      setReaderItem({ url, title, source: src });
      pushReaderHistory({ url, title, source: src });
      setReaderKey(prev => prev + 1);
      setReaderOpen(true);
    },
    [linkBehavior, noIframeSources, pushReaderHistory]
  );

  const closeReader = useCallback(() => {
    setReaderOpen(false);
    setReaderEmbedBlocked(false);
    setReaderHeaderLoading(false);
  }, []);

  const reloadReader = useCallback(() => {
    setReaderEmbedBlocked(false);
    setReaderHeaderLoading(true);
    setReaderKey(prev => prev + 1);
  }, []);

  const openReaderPrev = useCallback(
    (prevItem) => {
      if (!prevItem) return;
      setReaderEmbedBlocked(false);
      setReaderHeaderLoading(true);
      setReaderItem(prevItem);
      pushReaderHistory(prevItem);
      setReaderKey(prev => prev + 1);
    },
    [pushReaderHistory]
  );

  const openReaderNext = useCallback(
    (nextItem) => {
      if (!nextItem) return;
      setReaderEmbedBlocked(false);
      setReaderHeaderLoading(true);
      setReaderItem(nextItem);
      pushReaderHistory(nextItem);
      setReaderKey(prev => prev + 1);
    },
    [pushReaderHistory]
  );

  const onIframeLoad = useCallback(() => {
    window.clearTimeout(window.__readerTimeout);
    setReaderHeaderLoading(false);
  }, []);

  const onIframeError = useCallback((e) => {
    console.error('Iframe 加载失败:', e);
    setReaderHeaderLoading(false);
    setReaderEmbedBlocked(true);
  }, []);

  const neighbors = useMemo(() => {
    return computeReaderNeighbors({ url: readerItem?.url, source: readerItem?.source });
  }, [computeReaderNeighbors, readerItem?.url, readerItem?.source]);

  return {
    readerOpen,
    readerItem,
    readerKey,
    readerEmbedBlocked,
    readerHeaderLoading,
    readerHistory,

    openReaderFromItem,
    closeReader,
    reloadReader,
    onIframeLoad,
    onIframeError,
    openReaderPrev,
    openReaderNext,

    prevItem: neighbors.prevItem,
    nextItem: neighbors.nextItem,
  };
}
