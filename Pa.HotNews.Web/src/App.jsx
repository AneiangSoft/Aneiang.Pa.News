import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useLocalStorageSet } from './hooks/useLocalStorageSet';
import { useLinkBehaviorTip } from './hooks/useLinkBehaviorTip';
import { useSourceConfig } from './hooks/useSourceConfig';
import { useFavorites } from './hooks/useFavorites';
import { useNews } from './hooks/useNews';
import { useReader } from './hooks/useReader';


import Poster from './components/Poster';
import { nodeToPngBlob, downloadBlob } from './utils/poster';
import { getSiteOrigin, toAbsoluteUrl } from './utils/site';
import { Grid } from 'antd';
import AppHeader from './components/AppHeader';
import PosterModal from './components/PosterModal';
import ReaderDrawer from './components/ReaderDrawer';
import FavoritesDrawer from './components/FavoritesDrawer';
import SourceManagerDrawer from './components/SourceManagerDrawer';
import MainView from './components/MainView';
import {
  message,
  BackTop,
} from 'antd';
import {
  ArrowUpOutlined,
} from '@ant-design/icons';

import { getSources, getNews } from './services/api';
import { getFeatures } from './services/features';
import { getSourceDisplayName } from './config/newsUiConfig';

import { formatTime, getFullTimeString } from './utils/formatTime';
import { highlightText } from './utils/highlight';
import { quickShare } from './utils/share';
import { NEWS_UI, SOURCES } from './config/newsUiConfig';
import { generateSnapshot } from './utils/snapshot';
import { updateSeo } from './utils/seo';
import { getSiteConfig } from './services/siteConfig';
import { preloadSourceLogos } from './utils/preloadLogos';
import './App.css';

const getChineseSourceName = (s) => getSourceDisplayName(s);

function App() {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.xl;

  // 功能开关（Feature Flags）
  const [features, setFeatures] = useState({});

  const isFeatureEnabled = useCallback((key) => {
    if (!key) return true;
    return !!features?.[key];
  }, [features]);

  // 页面视图：使用 URL 参数 view 控制，默认 hotnews
  const getViewFromUrl = () => {
    try {
      const url = new URL(location.href);
      const v = (url.searchParams.get('view') || '').trim().toLowerCase();
      return v || 'hotnews';
    } catch {
      // ignore
    }
    return 'hotnews';
  };

  const [view, setView] = useState(getViewFromUrl);

  // 视图注册表：后续新增功能只需要在这里追加一项
  const VIEW_DEFS = useMemo(
    () => [
      { key: 'hotnews', label: '热榜', featureKey: null },
      { key: 'llm', label: '大模型', featureKey: 'llmRanking' },
    ],
    []
  );

  const availableViews = useMemo(() => {
    return VIEW_DEFS.filter(v => isFeatureEnabled(v.featureKey));
  }, [VIEW_DEFS, isFeatureEnabled]);

  const handleViewChange = newView => {
    // 防御：若该 view 未启用，不允许切换
    const def = VIEW_DEFS.find(v => v.key === newView);
    if (!def || !isFeatureEnabled(def.featureKey)) return;

    if (view === newView) return;

    setView(newView);
    const url = new URL(window.location);

    if (newView === 'hotnews') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', newView);
    }
    window.history.pushState({ view: newView }, '', url);
  };

  // 热榜数据加载（抽到 hook）
  const {
    newsBySource,
    isFirstLoading,
    fetchAllNews,
    retrySource,
    didFetchRef,
  } = useNews({
    getSources,
    getNews,
    onSyncSources: (normalized) => {
      // 同步来源配置（新增源自动加入；消失的源从配置中移除）
      setSourceCfg(prev => {
        const prevOrder = Array.isArray(prev?.order) ? prev.order : [];
        const prevHidden = new Set(Array.isArray(prev?.hidden) ? prev.hidden : []);

        const order = prevOrder.filter(s => normalized.includes(s));
        for (const s of normalized) {
          if (!order.includes(s)) order.push(s);
        }

        const hidden = Array.from(prevHidden).filter(s => normalized.includes(s));
        return { ...prev, order, hidden };
      });
    },
    onGlobalError: () => message.error('获取新闻源失败', 3),
  });

  // theme: dark | light | warm
  const [theme, setTheme] = useLocalStorageState('theme', () => 'light');

  // 打开方式：in-app (站内阅读) | new-tab (新标签页)
  const LINK_BEHAVIOR_KEY = 'linkBehaviorV1';
  const [linkBehavior, setLinkBehavior] = useLocalStorageState(LINK_BEHAVIOR_KEY, () => 'in-app');

  // URL 参数指定的“仅显示来源”（白名单）。null 表示不限制。
  const [sourceWhitelist, setSourceWhitelist] = useState(null);

  // 来源订阅/排序配置
  const SOURCE_CFG_KEY = 'sourceConfigV1';
  const [sourceCfg, setSourceCfg] = useLocalStorageState(SOURCE_CFG_KEY, () => ({ order: [], hidden: [] }));

  const [sourceMgrOpen, setSourceMgrOpen] = useState(false);

  // 已读：用 URL 做 key（更准确）。用 Set 提升查询效率。
  const READ_KEY = 'readNewsUrls';
  const [readSet, readSetApi] = useLocalStorageSet(READ_KEY);



  // 首次进入：解析 URL 参数（q/theme/sources/view）
  // - q: 搜索词
  // - theme: dark|light|warm
  // - sources: 仅显示这些来源（逗号分隔）
  // - view: hotnews|llm（大模型排行）
  useEffect(() => {
    const onPopState = () => {
      // 处理浏览器前进/后退：根据 URL 参数同步 view
      setView(getViewFromUrl());
    };
    window.addEventListener('popstate', onPopState);

    try {
      const url = new URL(location.href);
      const sp = url.searchParams;

      const q = (sp.get('q') || '').trim();
      if (q) setQuery(q);

      const t = (sp.get('theme') || '').trim();
      if (t === 'dark' || t === 'light' || t === 'warm') setTheme(t);

      const sourcesRaw = (sp.get('sources') || '').trim();
      if (sourcesRaw) {
        const list = sourcesRaw
          .split(',')
          .map(x => x.trim().toLowerCase())
          .filter(Boolean);
        setSourceWhitelist(list.length ? Array.from(new Set(list)) : null);
      }

      const viewRaw = (sp.get('view') || '').trim().toLowerCase();
      if (viewRaw) setView(viewRaw);
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [setTheme]);

  // 51LA 页脚挂件容器
  const laWidgetRef = useRef(null);

  // 首次加载：获取配置、校验视图、加载新闻
  useEffect(() => {
    const init = async () => {
      // 使用 didFetchRef 防止 React 18 StrictMode 下的二次执行
      if (didFetchRef.current) return;
      didFetchRef.current = true;

      try {
        // 并行获取站点配置和功能开关
        const [cfg, f] = await Promise.all([
          getSiteConfig(),
          getFeatures(),
        ]);

        setSiteCfg(cfg || {});
        setFeatures(f || {});

        // 动态设置浏览器标题
        if (cfg?.title && String(cfg.title).trim()) {
          const base = String(cfg.title).trim();
          const suffix = (cfg?.titleSuffix && String(cfg.titleSuffix)) || ' - 全网热点实时聚合';
          document.title = `${base}${suffix}`;
        }

        // 校验当前视图是否可用
        const v = getViewFromUrl();
        const def = VIEW_DEFS.find(x => x.key === v);
        const isViewAvailable = def ? (def.featureKey ? !!(f && f[def.featureKey]) : true) : false;

        if (isViewAvailable) {
          setView(v);
        } else {
          setView('hotnews');
          try {
            const url = new URL(window.location);
            url.searchParams.delete('view');
            window.history.replaceState({ view: 'hotnews' }, '', url);
          } catch {
            // ignore
          }
        }

      } catch (error) {
        console.error('Failed to fetch initial config:', error);
      }

      // 最后加载新闻数据
      fetchAllNews();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 动态注入 51LA 挂件脚本（React 里直接写 <script> 往往不会执行）
  useEffect(() => {
    const host = laWidgetRef.current;
    if (!host) return;

    // 避免重复注入
    if (host.querySelector('#LA-DATA-WIDGET')) return;

    const script = document.createElement('script');
    script.id = 'LA-DATA-WIDGET';
    script.crossOrigin = 'anonymous';
    script.src =
      'https://v6-widget.51.la/v6/3OZRKRdbxOzOcQYq/quote.js?theme=0&f=12&display=0,1,1,1,0,0,0,1';

    host.appendChild(script);

    // 可选：卸载时清理（一般不需要，但保持干净）
    return () => {
      try {
        host.innerHTML = '';
      } catch {
        // ignore
      }
    };
  }, []);

  // 应用主题到根节点（CSS 变量在 App.css 里通过 :root[data-theme] 控制）
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 预加载来源 logo：避免从 llm 切回热榜时批量请求图标导致卡顿
  useEffect(() => {
    const run = () => preloadSourceLogos({ theme });

    // 优先在空闲时执行，避免抢占主线程
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => run(), { timeout: 1500 });
      return () => {
        try {
          window.cancelIdleCallback(id);
        } catch {
          // ignore
        }
      };
    }

    const t = window.setTimeout(run, 600);
    return () => window.clearTimeout(t);
  }, [theme]);

  const markAsRead = url => {
    if (!url) return;
    readSetApi.add(url);
  };

  // 收藏：用 url 做 key，值存 { url, title, source, ts }
  const FAVORITE_KEY = 'favoriteNews';
  const [favoriteMap, setFavoriteMap] = useLocalStorageState(FAVORITE_KEY, () => ({}));

  const [favOpen, setFavOpen] = useState(false);

  // 全局搜索（跨来源过滤标题）
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // SEO：根据搜索词动态更新 title/description/keywords/canonical
  useEffect(() => {
    updateSeo({ query: deferredQuery });
  }, [deferredQuery]);

  // 移动端：导航下拉菜单
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 已知不支持 iframe 嵌入的来源：从配置读取（capabilities.iframe === false）
  const NO_IFRAME_SOURCES = useMemo(
    () => new Set(Object.keys(SOURCES || {}).filter(k => SOURCES[k]?.capabilities?.iframe === false)),
    []
  );

  // 切换到“站内阅读”时提示（仅切换触发，刷新不提示）
  useLinkBehaviorTip({
    linkBehavior,
    blockedSources: NO_IFRAME_SOURCES,
    getChineseSourceName,
  });

  // 站内阅读（抽到 hook）
  const {
    readerOpen,
    readerItem,
    readerKey,
    readerEmbedBlocked,
    readerHeaderLoading,
    openReaderFromItem,
    closeReader,
    reloadReader,
    onIframeLoad,
    onIframeError,
    openReaderPrev,
    openReaderNext,
    prevItem,
    nextItem,
  } = useReader({
    linkBehavior,
    noIframeSources: NO_IFRAME_SOURCES,
    query: deferredQuery,
    newsBySource,
  });

  // 站点配置（页脚等）
  const [siteCfg, setSiteCfg] = useState({});

  // 海报生成
  const posterRef = useRef(null);
  const [posterData, setPosterData] = useState(null); // { title, items, updatedTime }
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [posterPreviewOpen, setPosterPreviewOpen] = useState(false); // 新增状态控制预览弹窗


  const sharePage = async () => {
    const res = await quickShare({
      title: NEWS_UI?.share?.pageTitle || 'Aneiang 热榜聚合',
      text: NEWS_UI?.share?.pageText || '全网热点实时聚合（知乎/微博/抖音/头条/B站等）',
      url: location.href,
    });

    if (res.ok && res.method === 'copy') message.success('链接已复制');
    else if (!res.ok && res.method === 'copy') message.error('复制失败');
  };

  // 生成并下载单个来源的海报图片
  const generatePoster = async (source, items, updatedTime) => {
    if (isGeneratingPoster) return;

    // 只负责打开预览（不在这里直接下载）
    setPosterData({
      title: getChineseSourceName(source),
      items,
      updatedTime,
    });
    setPosterPreviewOpen(true);
  };

  const downloadPosterFromPreview = async () => {
    if (isGeneratingPoster) return;
    if (!posterRef.current || !posterData) return;

    setIsGeneratingPoster(true);

    try {
      const themeBgMap = {
        light: '#f6f7fb',
        warm: '#12110f',
        dark: '#0b1220',
      };

      const blob = await nodeToPngBlob(posterRef.current, {
        pixelRatio: 2, // 2x 分辨率
        // 兜底：导出时强制背景色跟随主题（避免透明背景导致保存后变黑/变白）
        backgroundColor: themeBgMap[theme] || themeBgMap.dark,
      });

      const updatedTime = posterData?.updatedTime;
      const timeStr = updatedTime ? new Date(updatedTime).toISOString().split('T')[0] : '';
      const filename = `热榜-${posterData.title}${timeStr ? `-${timeStr}` : ''}.png`;
      await downloadBlob(blob, filename);
      message.success('海报已保存');
    } catch (e) {
      console.error('生成海报失败:', e);
      message.error('生成海报失败，请重试');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const copySnapshot = async ({ title, items, updatedTime, limit = 10 }) => {
    const text = `${generateSnapshot({ title, items, updatedTime, limit })}\n\n---\n来自：${location.href}`;
    const { copyText } = await import('./utils/clipboard');
    await copyText(text, { successMsg: '快照已复制', failMsg: '复制失败' });
  };

  const {
    isFavorited,
    toggleFavorite,
    clearFavorites,
    favoriteCount,
    favQuery,
    setFavQuery,
    favSource,
    setFavSource,
    favoriteSources,
    filteredFavoriteList,
  } = useFavorites({ favoriteMap, setFavoriteMap });

  // 收藏抽屉关闭时，清空搜索条件
  useEffect(() => {
    if (!favOpen) {
      setFavQuery('');
      setFavSource('all');
    }
  }, [favOpen, setFavQuery, setFavSource]);

  // 来源管理：计算当前所有来源（来自数据与 order 合并）
  const allSources = useMemo(() => {
    const set = new Set();
    Object.keys(newsBySource).forEach(s => set.add(s.toLowerCase()));
    (sourceCfg.order || []).forEach(s => set.add(String(s).toLowerCase()));
    return Array.from(set);
  }, [newsBySource, sourceCfg.order]);

  const { hiddenSet, setSourceVisible, moveSource, setSourceOrder, resetSourceCfg } = useSourceConfig({
    allSources,
    sourceCfg,
    setSourceCfg,
  });

  // 渲染用的来源顺序（先按配置顺序，再补齐遗漏），并应用 URL sources 白名单过滤
  const displaySources = useMemo(() => {
    const order = (sourceCfg.order || []).map(s => String(s).toLowerCase());
    const exists = new Set(allSources);
    const base = order.filter(s => exists.has(s));
    for (const s of allSources) {
      if (!base.includes(s)) base.push(s);
    }

    let list = base.filter(s => !hiddenSet.has(s));

    if (Array.isArray(sourceWhitelist) && sourceWhitelist.length) {
      const w = new Set(sourceWhitelist.map(x => String(x).toLowerCase()));
      list = list.filter(s => w.has(String(s).toLowerCase()));
    }

    return list;
  }, [allSources, hiddenSet, sourceCfg.order, sourceWhitelist]);

  const buildShareUrl = () => {
    const origin = getSiteOrigin();
    const url = new URL(origin + location.pathname);

    const q = query.trim();
    if (q) url.searchParams.set('q', q);

    if (theme && theme !== 'light') url.searchParams.set('theme', theme);

    if (Array.isArray(sourceWhitelist) && sourceWhitelist.length) {
      url.searchParams.set('sources', sourceWhitelist.join(','));
    }

    return url.toString();
  };

  const copyFilterLink = async () => {
    const url = buildShareUrl();
    const { copyText } = await import('./utils/clipboard');
    await copyText(url, { successMsg: '筛选链接已复制', failMsg: '复制失败' });
  };

  return (
    <div className="app-container">
      <AppHeader
        siteTitle={siteCfg?.title}
        theme={theme}
        setTheme={setTheme}
        view={view}
        availableViews={availableViews}
        handleViewChange={handleViewChange}
        query={query}
        setQuery={setQuery}
        linkBehavior={linkBehavior}
        setLinkBehavior={setLinkBehavior}
        copyFilterLink={copyFilterLink}
        sharePage={sharePage}
        onOpenSourceMgr={() => setSourceMgrOpen(true)}
        favoriteCount={favoriteCount}
        onOpenFavorites={() => setFavOpen(true)}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="app-main">
        <MainView
          view={view}
          isFeatureEnabled={isFeatureEnabled}
          isFirstLoading={isFirstLoading}
          siteTitle={siteCfg?.title}
          theme={theme}
          newsGridProps={{
            displaySources,
            newsBySource,
            getChineseSourceName,
            query: deferredQuery,
            readSet,
            linkBehavior,
            openReaderFromItem,
            markAsRead,
            isFavorited,
            toggleFavorite,
            copySnapshot,
            generatePoster,
            isGeneratingPoster,
            getFullTimeString,
            formatTime,
            highlightText,
            retrySource,
            noIframeSources: NO_IFRAME_SOURCES,
          }}
        />
      </main>

      {/* 来源管理 Drawer */}
      <SourceManagerDrawer
        open={sourceMgrOpen}
        onClose={() => setSourceMgrOpen(false)}
        width={420}
        allSources={allSources}
        sourceCfg={sourceCfg}
        hiddenSet={hiddenSet}
        getChineseSourceName={getChineseSourceName}
        resetSourceCfg={resetSourceCfg}
        setSourceVisible={setSourceVisible}
        moveSource={moveSource}
        setSourceOrder={setSourceOrder}
      />

      {/* 收藏 Drawer */}
      <FavoritesDrawer
        open={favOpen}
        onClose={() => setFavOpen(false)}
        favoriteCount={favoriteCount}
        filteredFavoriteList={filteredFavoriteList}
        favoriteSources={favoriteSources}
        favQuery={favQuery}
        setFavQuery={setFavQuery}
        favSource={favSource}
        setFavSource={setFavSource}
        clearFavorites={clearFavorites}
        readSet={readSet}
        linkBehavior={linkBehavior}
        markAsRead={markAsRead}
        openReaderFromItem={openReaderFromItem}
        toggleFavorite={toggleFavorite}
        getChineseSourceName={getChineseSourceName}
        highlightText={highlightText}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          {siteCfg?.icpLicense ? <span>备案号：{siteCfg.icpLicense}</span> : null}

          {siteCfg?.icpLicense ? <span className="footer-sep">·</span> : null}

          <span>版权：AneiangSoft © {new Date().getFullYear()}</span>

          <span className="footer-sep">·</span>

          <a href="https://github.com/AneiangSoft/Aneiang.Pa" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>

          <span className="footer-sep">·</span>

          {/* 51LA 访问统计展示（挂件） */}
          <span className="footer-51la" ref={laWidgetRef} />
        </div>
      </footer>

      {/* Back to Top */}
      <BackTop visibilityHeight={300} style={{ right: '18px', bottom: '18px' }}>
        <div className="back-top-btn">
          <ArrowUpOutlined />
        </div>
      </BackTop>

      {/* 站内阅读抽屉 */}
      <ReaderDrawer
        open={readerOpen}
        item={readerItem}
        iframeKey={readerKey}
        embedBlocked={readerEmbedBlocked}
        getChineseSourceName={getChineseSourceName}
        headerLoading={readerHeaderLoading}
        prevItem={prevItem}
        nextItem={nextItem}
        onPrev={() => openReaderPrev(prevItem)}
        onNext={() => openReaderNext(nextItem)}
        onClose={closeReader}
        onReload={reloadReader}
        onOpenInNewTab={() => {
          if (readerItem?.url) window.open(readerItem.url, '_blank', 'noopener,noreferrer');
        }}
        onCopyLink={async () => {
          if (!readerItem?.url) return;
          try {
            await navigator.clipboard.writeText(readerItem.url);
            message.success('链接已复制');
          } catch {
            message.error('复制失败');
          }
        }}
        onIframeLoad={onIframeLoad}
        onIframeError={onIframeError}
      />

      {/* 隐藏海报渲染容器（用于导出图片） */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -9999 }}>
        {posterData && (
          <Poster
            ref={posterRef}
            title={posterData.title}
            items={posterData.items}
            updatedTimeText={posterData.updatedTime ? getFullTimeString(posterData.updatedTime) : ''}
            siteText={siteCfg?.title || 'Aneiang 热榜聚合'}
            theme={theme}
            qrText={toAbsoluteUrl('/')}
          />
        )}
      </div>

      {/* 海报预览弹窗 */}
      <PosterModal
        open={posterPreviewOpen}
        onClose={() => setPosterPreviewOpen(false)}
        onDownload={downloadPosterFromPreview}
        downloading={isGeneratingPoster}
        width={540}
      >
        {posterData && (
          <Poster
            title={posterData.title}
            items={posterData.items}
            updatedTimeText={posterData.updatedTime ? getFullTimeString(posterData.updatedTime) : ''}
            siteText={siteCfg?.title || 'Aneiang 热榜聚合'}
            theme={theme}
            qrText={toAbsoluteUrl('/')}
            size="mobile"
          />
        )}
      </PosterModal>
    </div>
  );
}

export default App;
