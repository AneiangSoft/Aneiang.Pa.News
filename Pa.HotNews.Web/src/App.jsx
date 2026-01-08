import { useEffect, useMemo, useRef, useState } from 'react';


import Poster from './components/Poster';
import LogoDark from './assets/logo-dark.svg';
import LogoLight from './assets/logo-light.svg';
import LogoWarm from './assets/logo-warm.svg';
import { nodeToPngBlob, downloadBlob } from './utils/poster';
import { getSiteOrigin, getSiteHost, toAbsoluteUrl } from './utils/site';
import { Grid } from 'antd';
import {
  Spin,
  Dropdown,
  Card,
  List,
  Button,
  message,
  BackTop,
  Segmented,
  Tooltip,
  Drawer,
  Empty,
  Input,
  Select,
  Space,
  Checkbox,
  Divider,
  Badge,
} from 'antd';
import {
  ArrowUpOutlined,
  SyncOutlined,
  MenuOutlined,
  GithubOutlined,
  BulbOutlined,
  MoonOutlined,
  SunOutlined,
  StarOutlined,
  StarFilled,
  BookOutlined,
  DeleteOutlined,
  SettingOutlined,
  ShareAltOutlined,
  CopyOutlined,
  ArrowUpOutlined as UpOutlined,
  ArrowDownOutlined as DownOutlined,
} from '@ant-design/icons';

import { getSources, getNews } from './services/api';
import { getFeatures } from './services/features';
import LlmRanking from './components/LlmRanking';
import { formatTime, getFullTimeString } from './utils/formatTime';
import { highlightText } from './utils/highlight';
import { quickShare } from './utils/share';
import { generateSnapshot } from './utils/snapshot';
import { updateSeo } from './utils/seo';
import { getSiteConfig } from './services/siteConfig';
import './App.css';

// 英文源名 -> 中文展示名
const sourceNameMap = {
  zhihu: '知乎',
  weibo: '微博',
  baidu: '百度',
  douyin: '抖音',
  toutiao: '头条',
  bilibili: '哔哩哔哩',
  hupu: '虎扑',
  tencent: '腾讯',
  juejin: '掘金',
  thepaper: '澎湃',
  douban: '豆瓣',
  ifeng: '凤凰网',
  cnblog: '博客园',
  csdn: 'CSDN',
  github: 'GitHub',
  v2ex: 'V2EX',
  tieba: '贴吧',
  '36kr': '36氪',
};

// 忽略大小写获取中文名
const getChineseSourceName = s => sourceNameMap[s.toLowerCase()] || s;

function App() {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.xl;
  const [newsBySource, setNewsBySource] = useState({});

  // 功能开关（Feature Flags）
  const [features, setFeatures] = useState({});

  const isFeatureEnabled = (key) => {
    if (!key) return true;
    return !!features?.[key];
  };

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
  }, [VIEW_DEFS, features]);

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

  // 全局 loading 仅用于首次加载骨架屏
  const [isFirstLoading, setIsFirstLoading] = useState(true);

  // theme: dark | light | warm
  const getDefaultTheme = () => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light' || saved === 'warm') return saved;
    } catch {
      // ignore
    }

    // 默认主题：浅色
    return 'light';
  };

  const [theme, setTheme] = useState(getDefaultTheme);

  // URL 参数指定的“仅显示来源”（白名单）。null 表示不限制。
  const [sourceWhitelist, setSourceWhitelist] = useState(null);

  // 来源订阅/排序配置
  const SOURCE_CFG_KEY = 'sourceConfigV1';
  const [sourceCfg, setSourceCfg] = useState(() => {
    try {
      const raw = localStorage.getItem(SOURCE_CFG_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') {
        return {
          order: Array.isArray(parsed.order) ? parsed.order : [],
          hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
        };
      }
    } catch {
      // ignore
    }
    return { order: [], hidden: [] };
  });

  const [sourceMgrOpen, setSourceMgrOpen] = useState(false);

  // 已读：用 URL 做 key（更准确）。用 Set 提升查询效率。
  const READ_KEY = 'readNewsUrls';
  const [readSet, setReadSet] = useState(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) return new Set(arr.filter(Boolean));
    } catch {
      // ignore
    }
    return new Set();
  });

  // 拉取所有来源（首次加载/全量刷新用）
  const fetchAllNews = async () => {
    // 首次加载才展示全局 loading（后续刷新不遮挡页面）
    setIsFirstLoading(prev => prev);

    try {
      const sources = await getSources();

      // 同步来源配置（新增源自动加入；消失的源从配置中移除）
      const normalized = sources.map(s => s.toLowerCase());
      setSourceCfg(prev => {
        const prevOrder = Array.isArray(prev.order) ? prev.order : [];
        const prevHidden = new Set(Array.isArray(prev.hidden) ? prev.hidden : []);

        const order = prevOrder.filter(s => normalized.includes(s));
        for (const s of normalized) {
          if (!order.includes(s)) order.push(s);
        }

        const hidden = Array.from(prevHidden).filter(s => normalized.includes(s));
        return { order, hidden };
      });

      // 方案 1：分来源独立加载（避免单个平台过慢导致整页一直 loading）

      // 1) 先把所有来源置为 loading，让页面先渲染出卡片
      setNewsBySource(prev => {
        const next = { ...prev };
        for (const s of normalized) {
          // 保留旧数据（可选）：刷新时不闪空
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
      message.error('获取新闻源失败', 3);
      // 兜底：失败也要结束首屏 loading
      setIsFirstLoading(false);
    } finally {
      // 方案 1 中首屏 loading 已在 sources 成功后立即关闭，这里避免重复 setState
    }
  };

  // 仅重试某一个来源（卡片“重试”按钮用）
  const retrySource = async src => {
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
  };

  // React 18 + StrictMode 在开发环境会触发 effect 二次执行（挂载->卸载->再挂载），
  // 这里用 ref 兜底，避免 dev 下重复请求。
  const didFetchRef = useRef(false);

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
  }, []);

  // 51LA 页脚挂件容器
  const laWidgetRef = useRef(null);

  // 首次加载：先获取 features，再决定 view 是否允许，并加载热榜
  useEffect(() => {
    const init = async () => {
      // 站点配置（不阻塞主流程；失败时降级为默认）
      try {
        const cfg = await getSiteConfig();
        setSiteCfg(cfg || {});

        // 动态浏览器标题：Title + 可选后缀（默认后缀：" - 全网热点实时聚合"）
        if (cfg?.title && String(cfg.title).trim()) {
          const base = String(cfg.title).trim();
          const suffix = (cfg?.titleSuffix && String(cfg.titleSuffix)) || ' - 全网热点实时聚合';
          document.title = `${base}${suffix}`;
        }
      } catch {
        // ignore
      }

      const f = await getFeatures();
      setFeatures(f || {});

      // view 校验：若当前 view 不可用，则回退 hotnews，并清理 URL
      const v = getViewFromUrl();
      const def = VIEW_DEFS.find(x => x.key === v);
      const ok = def ? (def.featureKey ? !!(f && f[def.featureKey]) : true) : false;

      if (!ok) {
        setView('hotnews');
      } else {
        // 若可用，允许通过 URL 直达
        setView(v);
      }

      if (!ok) {
        try {
          const url = new URL(window.location);
          url.searchParams.delete('view');
          window.history.replaceState({ view: 'hotnews' }, '', url);
        } catch {
          // ignore
        }
      }

      if (didFetchRef.current) return;
      didFetchRef.current = true;
      fetchAllNews();
    };

    init();
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
    script.charset = 'UTF-8';
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
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // 持久化来源配置
  useEffect(() => {
    try {
      localStorage.setItem(SOURCE_CFG_KEY, JSON.stringify(sourceCfg));
    } catch {
      // ignore
    }
  }, [sourceCfg]);

  // 持久化已读集合
  useEffect(() => {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(Array.from(readSet)));
    } catch {
      // ignore
    }
  }, [readSet]);

  const markAsRead = url => {
    if (!url) return;
    setReadSet(prev => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  // 收藏：用 url 做 key，值存 { url, title, source, ts }
  const FAVORITE_KEY = 'favoriteNews';
  const [favoriteMap, setFavoriteMap] = useState(() => {
    try {
      const raw = localStorage.getItem(FAVORITE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      if (obj && typeof obj === 'object') return obj;
    } catch {
      // ignore
    }
    return {};
  });

  const [favOpen, setFavOpen] = useState(false);

  // 全局搜索（跨来源过滤标题）
  const [query, setQuery] = useState('');

  // SEO：根据搜索词动态更新 title/description/keywords/canonical
  useEffect(() => {
    updateSeo({ query });
  }, [query]);

  // 移动端：导航下拉菜单
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 站点配置（页脚等）
  const [siteCfg, setSiteCfg] = useState({});

  // 海报生成
  const posterRef = useRef(null);
  const [posterData, setPosterData] = useState(null); // { title, items, updatedTime }
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITE_KEY, JSON.stringify(favoriteMap));
    } catch {
      // ignore
    }
  }, [favoriteMap]);

  const isFavorited = url => !!(url && favoriteMap[url]);

  const toggleFavorite = (item, source) => {
    if (!item?.url) return;
    setFavoriteMap(prev => {
      const next = { ...prev };
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
  };

  const sharePage = async () => {
    const res = await quickShare({
      title: 'Aneiang 热榜聚合',
      text: '全网热点实时聚合（知乎/微博/抖音/头条/B站等）',
      url: location.href,
    });

    if (res.ok && res.method === 'copy') message.success('链接已复制');
    else if (!res.ok && res.method === 'copy') message.error('复制失败');
  };

  // 生成并下载单个来源的海报图片
  const generatePoster = async (source, items, updatedTime) => {
    if (isGeneratingPoster) return;
    setIsGeneratingPoster(true);

    try {
      // 1. 设置海报数据（触发 Poster 组件渲染）
      setPosterData({
        title: getChineseSourceName(source),
        items,
        updatedTime,
      });

      // 2. 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 100));

      // 3. 捕获 DOM 为图片并下载
      if (posterRef.current) {
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

        const timeStr = updatedTime ? new Date(updatedTime).toISOString().split('T')[0] : '';
        const filename = `热榜-${getChineseSourceName(source)}${timeStr ? `-${timeStr}` : ''}.png`;
        await downloadBlob(blob, filename);
        message.success('海报已保存');
      }
    } catch (e) {
      console.error('生成海报失败:', e);
      message.error('生成海报失败，请重试');
    } finally {
      setIsGeneratingPoster(false);
      setPosterData(null);
    }
  };

  const copySnapshot = async ({ title, items, updatedTime, limit = 10 }) => {
    const text = `${generateSnapshot({ title, items, updatedTime, limit })}\n\n---\n来自：${location.href}`;

    try {
      await navigator.clipboard.writeText(text);
      message.success('快照已复制');
      return;
    } catch {
      // ignore
    }

    // 兼容降级：execCommand
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) message.success('快照已复制');
      else message.error('复制失败');
    } catch {
      message.error('复制失败');
    }
  };

  const clearFavorites = () => setFavoriteMap({});

  const favoriteList = useMemo(() => {
    return Object.values(favoriteMap).sort((a, b) => (b.ts || 0) - (a.ts || 0));
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

  // 来源管理：计算当前所有来源（来自数据与 order 合并）
  const allSources = useMemo(() => {
    const set = new Set();
    Object.keys(newsBySource).forEach(s => set.add(s.toLowerCase()));
    (sourceCfg.order || []).forEach(s => set.add(String(s).toLowerCase()));
    return Array.from(set);
  }, [newsBySource, sourceCfg.order]);

  const hiddenSet = useMemo(() => new Set(sourceCfg.hidden || []), [sourceCfg.hidden]);

  const setSourceVisible = (src, visible) => {
    const key = String(src).toLowerCase();
    setSourceCfg(prev => {
      const hidden = new Set(prev.hidden || []);
      if (visible) hidden.delete(key);
      else hidden.add(key);
      return { ...prev, hidden: Array.from(hidden) };
    });
  };

  const moveSource = (src, dir) => {
    const key = String(src).toLowerCase();
    setSourceCfg(prev => {
      const order = Array.isArray(prev.order) ? [...prev.order] : [];
      const idx = order.indexOf(key);
      if (idx < 0) return prev;
      const nextIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= order.length) return prev;
      const tmp = order[idx];
      order[idx] = order[nextIdx];
      order[nextIdx] = tmp;
      return { ...prev, order };
    });
  };

  const resetSourceCfg = () => {
    const normalized = allSources;
    setSourceCfg({ order: normalized, hidden: [] });
  };

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
    try {
      await navigator.clipboard.writeText(url);
      message.success('筛选链接已复制');
    } catch {
      // 降级
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) message.success('筛选链接已复制');
        else message.error('复制失败');
      } catch {
        message.error('复制失败');
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <img
            className="logo-img"
            src={{ dark: LogoDark, light: LogoLight, warm: LogoWarm }[theme]}
            alt="热榜聚合 Logo"
          />
          <h1>{siteCfg?.title || '热榜聚合'}</h1>

          {availableViews.length > 1 && (
            <Segmented
              value={view}
              onChange={handleViewChange}
              options={availableViews.map(v => ({ label: v.label, value: v.key }))}
            />
          )}
        </div>

        {/* 桌面端：原来的导航 */}
        {!isMobile && (
          <div className="actions">
            <Input
              allowClear
              className="search-input"
              placeholder="搜索所有热榜标题..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />

            <Tooltip title="主题切换（深色 / 浅色 / 护眼暖色）">
              <Segmented
                value={theme}
                onChange={setTheme}
                options={[
                  { label: '深色', value: 'dark', icon: <MoonOutlined /> },
                  { label: '浅色', value: 'light', icon: <SunOutlined /> },
                  { label: '护眼', value: 'warm', icon: <BulbOutlined /> },
                ]}
              />
            </Tooltip>

            <Tooltip title="复制当前筛选链接">
              <Button type="default" icon={<CopyOutlined />} onClick={copyFilterLink} />
            </Tooltip>

            <Tooltip title="分享本站">
              <Button type="default" icon={<ShareAltOutlined />} onClick={sharePage} />
            </Tooltip>

            <Tooltip title="来源管理">
              <Button type="default" icon={<SettingOutlined />} onClick={() => setSourceMgrOpen(true)} />
            </Tooltip>

            <Tooltip title="收藏">
              <Badge count={favoriteCount} size="small" offset={[-2, 2]}>
                <Button type="default" icon={<BookOutlined />} onClick={() => setFavOpen(true)} />
              </Badge>
            </Tooltip>

            <Tooltip title="GitHub">
              <Button
                type="default"
                icon={<GithubOutlined />}
                onClick={() =>
                  window.open(
                    'https://github.com/AneiangSoft/Aneiang.Pa.News',
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
              />
            </Tooltip>
          </div>
        )}

        {/* 移动端：下拉菜单 */}
        {isMobile && (
          <div className="actions mobile-actions">
            <Input
              allowClear
              className="search-input"
              placeholder="搜索所有热榜标题..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />

            <Dropdown
              trigger={['click']}
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              menu={{
                items: [
                  {
                    key: 'theme-dark',
                    label: '深色主题',
                    icon: <MoonOutlined />,
                    onClick: () => setTheme('dark'),
                  },
                  {
                    key: 'theme-light',
                    label: '浅色主题',
                    icon: <SunOutlined />,
                    onClick: () => setTheme('light'),
                  },
                  {
                    key: 'theme-warm',
                    label: '护眼主题',
                    icon: <BulbOutlined />,
                    onClick: () => setTheme('warm'),
                  },
                  { type: 'divider' },
                  {
                    key: 'share',
                    label: '分享本站',
                    icon: <ShareAltOutlined />,
                    onClick: sharePage,
                  },
                  {
                    key: 'source',
                    label: '来源管理',
                    icon: <SettingOutlined />,
                    onClick: () => setSourceMgrOpen(true),
                  },
                  {
                    key: 'fav',
                    label: `收藏${favoriteCount ? `（${favoriteCount}）` : ''}`,
                    icon: <BookOutlined />,
                    onClick: () => setFavOpen(true),
                  },
                  {
                    key: 'github',
                    label: 'Github',
                    icon: <GithubOutlined />,
                    onClick: () =>
                      window.open(
                        'https://github.com/AneiangSoft/Aneiang.Pa',
                        '_blank',
                        'noopener,noreferrer'
                      ),
                  },
                ],
              }}
            >
              <Button type="default" icon={<MenuOutlined />} />
            </Dropdown>
          </div>
        )}
      </header>

      <main className="app-main">
        {view === 'llm' && isFeatureEnabled('llmRanking') ? (
          <LlmRanking siteTitle={siteCfg?.title} theme={theme} />
        ) : (
          (() => {
            if (isFirstLoading) {
              return (
                <div className="spin-container">
                  <Spin size="large" />
                </div>
              );
            }

            const q = query.trim().toLowerCase();

            const cards = displaySources.map(src => {
              const block = newsBySource[src];
              const status = block?.status || 'loading';
              const news = block?.list;
              const updatedTime = block?.updatedTime;
              const errorMsg = block?.error;
              const filtered = q
                ? (news || []).filter(n => (n?.title || '').toLowerCase().includes(q))
                : news;

              return {
                src,
                status,
                news,
                updatedTime,
                errorMsg,
                filtered,
                title: getChineseSourceName(src),
              };
            });

            // 搜索中：若所有“成功卡片”都无匹配（且至少有一个成功卡片），则显示友好空状态
            if (q) {
              const successCards = cards.filter(x => x.status === 'success');
              const hasAnyMatch = successCards.some(x => (x.filtered?.length ?? 0) > 0);

              if (successCards.length > 0 && !hasAnyMatch) {
                return (
                  <div style={{ padding: '60px 0' }}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div>
                          <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
                            没有找到与“{query.trim()}”相关的内容
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            试试更换关键词，或清空搜索
                          </div>
                        </div>
                      }
                    />
                  </div>
                );
              }
            }

            return (
              <div className="news-grid">
                {cards
                  // 搜索时：只展示“有匹配数据”的卡片（避免一堆空卡片）
                  .filter(x => (q ? x.status !== 'success' || (x.filtered?.length ?? 0) > 0 : true))
                  .map(({ src, status, news, updatedTime, errorMsg, filtered, title }) => {
                    return (
                      <Card
                        key={src}
                        title={title}
                        extra={
                          <span className="card-extra">
                            {status === 'error' ? (
                              <Tooltip title={errorMsg || '加载失败'}>
                                <span className="card-error-label">加载失败</span>
                              </Tooltip>
                            ) : updatedTime ? (
                              <span className="card-updated" title={getFullTimeString(updatedTime)}>
                                {formatTime(updatedTime)}
                              </span>
                            ) : null}

                            {q && status === 'success' ? (
                              <span className="card-extra-count">{`${filtered.length} / ${(news || []).length}`}</span>
                            ) : null}

                            {status === 'success' && (
                              <Space size={2}>
                                <Tooltip title="复制快照">
                                  <Button
                                    type="text"
                                    size="small"
                                    className="card-action-btn"
                                    icon={<CopyOutlined />}
                                    onClick={e => {
                                      e.stopPropagation();
                                      copySnapshot({
                                        title,
                                        items: news,
                                        updatedTime,
                                      });
                                    }}
                                  />
                                </Tooltip>

                                <Tooltip title="生成海报">
                                  <Button
                                    type="text"
                                    size="small"
                                    className="card-action-btn"
                                    icon={<ShareAltOutlined />}
                                    loading={isGeneratingPoster}
                                    onClick={e => {
                                      e.stopPropagation();
                                      generatePoster(src, news || [], updatedTime);
                                    }}
                                  />
                                </Tooltip>
                              </Space>
                            )}
                          </span>
                        }
                        className={`source-card status-${status}`}
                        data-source={src.toLowerCase()}
                      >
                        {status === 'error' ? (
                          <div className="card-state-body">
                            <div className="card-error-visual" aria-hidden="true">
                              <img className="card-error-img" src="/error.svg" alt="" />
                            </div>

                            <div className="card-error-text">加载失败</div>

                            <div className="card-error-actions">
                              <Button size="small" icon={<SyncOutlined />} onClick={() => retrySource(src)}>
                                重试该来源
                              </Button>
                            </div>

                            <div className="card-error-hint">提示：可能是接口限流/网络波动，稍等片刻再试。</div>
                          </div>
                        ) : status === 'success' ? (
                          filtered?.length ? (
                            <List
                              className="news-list"
                              dataSource={filtered}
                              renderItem={(item, idx) => (
                                <List.Item>
                                  <span className="news-rank">{idx + 1}</span>

                                  <Tooltip
                                    title={item.title}
                                    placement="topLeft"
                                    mouseEnterDelay={0.2}
                                    overlayClassName="news-title-tooltip"
                                  >
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={readSet.has(item.url) ? 'is-read' : ''}
                                      onClick={() => markAsRead(item.url)}
                                    >
                                      {highlightText(item.title, query)}
                                    </a>
                                  </Tooltip>

                                  <button
                                    type="button"
                                    className={isFavorited(item.url) ? 'fav-btn is-fav' : 'fav-btn'}
                                    title={isFavorited(item.url) ? '取消收藏' : '收藏'}
                                    onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleFavorite(item, src);
                                    }}
                                  >
                                    {isFavorited(item.url) ? <StarFilled /> : <StarOutlined />}
                                  </button>
                                </List.Item>
                              )}
                            />
                          ) : (
                            <div className="card-state-body">
                              <Empty description={q ? '没有匹配结果' : '暂无数据'} />
                            </div>
                          )
                        ) : (
                          <div className="card-state-body">
                            <Spin size="small" />
                            <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>加载中...</span>
                          </div>
                        )}
                      </Card>
                    );
                  })}
              </div>
            );
          })()
        )}
      </main>

      {/* 来源管理 Drawer */}
      <Drawer
        title="来源管理"
        placement="right"
        width={420}
        open={sourceMgrOpen}
        onClose={() => setSourceMgrOpen(false)}
        extra={
          <Button type="default" onClick={resetSourceCfg}>
            重置
          </Button>
        }
      >
        <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 10 }}>
          勾选显示/隐藏来源；使用上下箭头调整卡片顺序。
        </div>

        <div style={{ marginBottom: 10 }}>
          <Checkbox
            indeterminate={
              (sourceCfg.order || []).length
                ? sourceCfg.hidden.length > 0 && sourceCfg.hidden.length < (sourceCfg.order || []).length
                : sourceCfg.hidden.length > 0 && sourceCfg.hidden.length < allSources.length
            }
            checked={
              (sourceCfg.order || []).length
                ? sourceCfg.hidden.length === 0
                : sourceCfg.hidden.length === 0
            }
            onChange={e => {
              const checked = e.target.checked;
              if (checked) {
                // 全选：清空 hidden
                setSourceCfg(prev => ({ ...prev, hidden: [] }));
              } else {
                // 取消全选：全部隐藏
                const list = (sourceCfg.order || []).length ? sourceCfg.order : allSources;
                setSourceCfg(prev => ({ ...prev, hidden: list.map(s => String(s).toLowerCase()) }));
              }
            }}
          >
            全选
          </Checkbox>
        </div>

        <List
          dataSource={(sourceCfg.order || []).length ? sourceCfg.order : allSources}
          renderItem={(s, idx) => {
            const src = String(s).toLowerCase();
            const visible = !hiddenSet.has(src);
            return (
              <List.Item
                actions={[
                  <Button
                    key="up"
                    type="text"
                    icon={<UpOutlined />}
                    disabled={idx === 0}
                    onClick={() => moveSource(src, 'up')}
                  />,
                  <Button
                    key="down"
                    type="text"
                    icon={<DownOutlined />}
                    disabled={idx === (sourceCfg.order || []).length - 1}
                    onClick={() => moveSource(src, 'down')}
                  />,
                ]}
              >
                <Checkbox checked={visible} onChange={e => setSourceVisible(src, e.target.checked)}>
                  {getChineseSourceName(src)}
                </Checkbox>
              </List.Item>
            );
          }}
        />
        <Divider />
        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          提示：隐藏来源不会删除数据，只是不在首页展示。
        </div>
      </Drawer>

      {/* 收藏 Drawer */}
      <Drawer
        title={`收藏（${favoriteCount}）`}
        placement="right"
        width={420}
        open={favOpen}
        onClose={() => setFavOpen(false)}
        extra={
          <Button danger icon={<DeleteOutlined />} onClick={clearFavorites} disabled={favoriteCount === 0}>
            清空
          </Button>
        }
      >
        {favoriteCount === 0 ? (
          <Empty description="暂无收藏" />
        ) : (
          <>
            <Space className="fav-tools" direction="vertical" size={10} style={{ width: '100%' }}>
              <Input
                allowClear
                placeholder="在收藏中搜索标题..."
                value={favQuery}
                onChange={e => setFavQuery(e.target.value)}
              />
              <Select
                value={favSource}
                onChange={setFavSource}
                options={[
                  { value: 'all', label: '全部来源' },
                  ...favoriteSources.map(s => ({ value: s, label: getChineseSourceName(s) })),
                ]}
              />
            </Space>

            {filteredFavoriteList.length === 0 ? (
              <Empty description="没有匹配的收藏" style={{ marginTop: 24 }} />
            ) : (
              <List
                style={{ marginTop: 12 }}
                dataSource={filteredFavoriteList}
                renderItem={fav => (
                  <List.Item>
                    <Tooltip
                      title={fav.title}
                      placement="topLeft"
                      mouseEnterDelay={0.2}
                      overlayClassName="news-title-tooltip"
                    >
                      <a
                        href={fav.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={readSet.has(fav.url) ? 'is-read' : ''}
                        onClick={() => markAsRead(fav.url)}
                      >
                        {highlightText(fav.title, favQuery)}
                      </a>
                    </Tooltip>
                    <button
                      type="button"
                      className="fav-btn is-fav"
                      title="取消收藏"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite({ url: fav.url, title: fav.title }, fav.source);
                      }}
                    >
                      <StarFilled />
                    </button>
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </Drawer>

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

      {/* 隐藏海报渲染容器（用于导出图片） */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -9999 }}>
        {posterData && (
          <Poster
            ref={posterRef}
            title={posterData.title}
            items={posterData.items}
            updatedTimeText={posterData.updatedTime ? getFullTimeString(posterData.updatedTime) : ''}
            siteText={getSiteHost()}
            theme={theme}
            qrText={toAbsoluteUrl('/')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
