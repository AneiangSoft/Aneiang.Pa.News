import { startTransition, useCallback, useMemo, useState } from 'react';

export function useFavorites({ favoriteMap, setFavoriteMap }) {
  const isFavorited = useCallback((url) => !!(url && favoriteMap && favoriteMap[url]), [favoriteMap]);

  const toggleFavorite = useCallback(
    (item, source) => {
      if (!item?.url) return;
      startTransition(() => {
        setFavoriteMap(prev => {
          const next = { ...(prev || {}) };
          if (next[item.url]) {
            delete next[item.url];
          } else {
            next[item.url] = {
              url: item.url,
              title: item.title,
              source,
              ts: Date.now(),
            };
          }
          return next;
        });
      });
    },
    [setFavoriteMap]
  );

  const clearFavorites = useCallback(() => setFavoriteMap({}), [setFavoriteMap]);

  const favoriteList = useMemo(() => {
    return Object.values(favoriteMap || {}).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [favoriteMap]);

  const favoriteCount = favoriteList.length;

  // 收藏 Drawer 内搜索/筛选
  const [favQuery, setFavQuery] = useState('');
  const [favSource, setFavSource] = useState('all');

  const favoriteSources = useMemo(() => {
    const set = new Set(favoriteList.map(x => x.source).filter(Boolean));
    return Array.from(set).sort();
  }, [favoriteList]);

  const filteredFavoriteList = useMemo(() => {
    const q = favQuery.trim().toLowerCase();
    return favoriteList.filter(item => {
      if (favSource !== 'all' && item.source !== favSource) return false;
      if (!q) return true;
      return (item.title || '').toLowerCase().includes(q);
    });
  }, [favoriteList, favQuery, favSource]);

  return {
    isFavorited,
    toggleFavorite,
    clearFavorites,
    favoriteList,
    favoriteCount,
    favQuery,
    setFavQuery,
    favSource,
    setFavSource,
    favoriteSources,
    filteredFavoriteList,
  };
}
