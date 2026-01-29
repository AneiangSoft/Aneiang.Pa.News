import { useCallback, useRef, useState } from 'react';

/**
 * useNews
 * - 管理 newsBySource / isFirstLoading
 * - 提供 fetchAllNews / retrySource
 * - 通过 onSyncSources 回调把“来源列表变化”同步给外部（例如 sourceCfg）
 */
export function useNews({ getSources, getNews, onSyncSources, onGlobalError, sourceWhitelist }) {
  const [newsBySource, setNewsBySource] = useState({});
  const [isFirstLoading, setIsFirstLoading] = useState(true);

  // React 18 + StrictMode dev 下可能重复执行 effect，这里提供一个 ref 给外部控制也行
  const didFetchRef = useRef(false);

  const fetchAllNews = useCallback(async () => {
    // 首次加载才展示全局 loading（后续刷新不遮挡页面）
    setIsFirstLoading(prev => prev);

    try {
      const sources = await getSources();
      let normalized = (sources || []).map(s => String(s).toLowerCase()).filter(Boolean);

      if (Array.isArray(sourceWhitelist) && sourceWhitelist.length) {
        const w = new Set(sourceWhitelist.map(s => String(s).toLowerCase()));
        normalized = normalized.filter(s => w.has(s));
      }

      // 同步来源配置（新增源自动加入；消失的源从配置中移除）
      if (onSyncSources) {
        onSyncSources(normalized);
      }

      // 1) 先把所有来源置为 loading，让页面先渲染出卡片（刷新时保留旧数据，避免闪空）
      setNewsBySource(prev => {
        const next = { ...prev };
        for (const s of normalized) {
          next[s] = {
            status: 'loading',
            list: next[s]?.list || [],
            updatedTime: next[s]?.updatedTime ?? null,
            error: null,
          };
        }
        return next;
      });

      // 2) 立即结束“全局首屏 loading”，不再等待所有来源完成
      setIsFirstLoading(false);

      // 3) 每个来源独立请求，谁先回来先更新谁（互不阻塞）
      normalized.forEach(async key => {
        try {
          const payload = await getNews(key);
          const list = Array.isArray(payload?.data) ? payload.data : payload?.data?.items || [];
          const updatedTime = payload?.updatedTime ?? payload?.data?.updatedTime ?? payload?.data?.updateTime;

          setNewsBySource(prev => ({
            ...prev,
            [key]: { status: 'success', list, updatedTime, error: null },
          }));
        } catch (e) {
          const errMsg = e?.message || '请求失败';
          setNewsBySource(prev => ({
            ...prev,
            [key]: { status: 'error', list: [], updatedTime: null, error: errMsg },
          }));
        }
      });
    } catch (e) {
      setIsFirstLoading(false);
      if (onGlobalError) onGlobalError(e);
    }
  }, [getSources, getNews, onSyncSources, onGlobalError, sourceWhitelist]);

  const retrySource = useCallback(
    async (src) => {
      const key = String(src || '').toLowerCase();
      if (!key) return;

      // 先把该来源置为 loading（不影响其它来源）
      setNewsBySource(prev => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          status: 'loading',
          error: null,
        },
      }));

      try {
        const payload = await getNews(key, { bustCache: true });
        const list = Array.isArray(payload?.data) ? payload.data : payload?.data?.items || [];
        const updatedTime = payload?.updatedTime ?? payload?.data?.updatedTime ?? payload?.data?.updateTime;

        setNewsBySource(prev => ({
          ...prev,
          [key]: { status: 'success', list, updatedTime, error: null },
        }));
      } catch (e) {
        const errMsg = e?.message || '请求失败';
        setNewsBySource(prev => ({
          ...prev,
          [key]: { status: 'error', list: [], updatedTime: null, error: errMsg },
        }));
      }
    },
    [getNews]
  );

  return {
    newsBySource,
    setNewsBySource,
    isFirstLoading,
    setIsFirstLoading,
    fetchAllNews,
    retrySource,
    didFetchRef,
  };
}
