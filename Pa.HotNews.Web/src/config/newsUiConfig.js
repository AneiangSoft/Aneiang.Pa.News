export const NEWS_UI = {
  sourceManager: {
    defaultOrder: null,
    defaultHidden: [],
  },
  tabs: {
    defaultGroupKey: 'all',
    countMode: 'sourceCount',
    showDot: true,
  },
  i18n: {
    iframeBlockedTag: '站内受限',
    iframeBlockedTip: '该来源可能无法站内阅读，点击将直接在新标签页打开（也可 Ctrl/⌘ + 点击标题）',
  },
  share: {
    pageTitle: 'Aneiang 热榜聚合',
    pageText: '全网热点实时聚合（知乎/微博/抖音/头条/B站等）',
  },
};

export const GROUPS = [
  {
    key: 'all',
    label: '全部',
    dotColor: null,
    sources: [],
  },
  {
    key: 'hot',
    label: '热点',
    dotColor: '#ef4444',
    sources: ['weibo', 'baidu', 'toutiao', 'tencent', 'thepaper', 'ifeng'],
  },
  {
    key: 'community',
    label: '社区',
    dotColor: '#a78bfa',
    sources: ['zhihu', 'v2ex', 'tieba', 'hupu', 'douban'],
  },
  {
    key: 'tech',
    label: '技术',
    dotColor: '#22c55e',
    sources: ['juejin', 'csdn', 'cnblog', 'github'],
  },
  {
    key: 'biz',
    label: '商业',
    dotColor: '#f59e0b',
    sources: ['_36kr', 'ithome'],
  },
  {
    key: 'video',
    label: '视频',
    dotColor: '#fb7185',
    sources: ['douyin', 'bilibili'],
  },
  {
    key: 'other',
    label: '其他',
    dotColor: null,
    sources: null,
  },
];

// 统一的来源配置：显示名 + 能力 + 头部样式 + logo 等
// logo 支持：
// - string: 同一张图适配所有主题
// - { light?: string, dark?: string, warm?: string }: 不同主题使用不同图
export const SOURCES = {
  zhihu: {
    name: '知乎',
    logo: "/sourcelogo/zhihu.ico",
    capabilities: { iframe: false },
    header: {
      background: 'linear-gradient(90deg, rgba(0, 132, 255, 0.70), rgba(0, 161, 255, 0.40))',
    },
  },
  weibo: {
    name: '微博',
    logo: "/sourcelogo/weibo.ico",
    header: {
      background: 'linear-gradient(90deg, rgba(255, 130, 0, 0.72), rgba(255, 157, 0, 0.44))',
    },
  },
  baidu: {
    name: '百度',
    logo: "/sourcelogo/baidu.ico",
    capabilities: { iframe: false },
    header: {
      background: 'linear-gradient(90deg, rgba(41, 50, 225, 0.70), rgba(74, 84, 232, 0.42))',
    },
  },
  douyin: {
    name: '抖音',
    logo: "/sourcelogo/douyin.png",
    capabilities: { iframe: false },
    header: {
      background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.68), rgba(51, 51, 51, 0.38))',
    },
  },
  toutiao: {
    name: '头条',
    logo: "/sourcelogo/toutiao.ico",
    capabilities: { iframe: false },
    header: {
      background: 'linear-gradient(90deg, rgba(255, 77, 79, 0.48), rgba(255, 120, 117, 0.26))',
    },
  },
  bilibili: {
    name: '哔哩哔哩',
    logo: '/sourcelogo/bilibili.ico',
    header: {
      background: 'linear-gradient(90deg, rgba(251, 114, 153, 0.70), rgba(255, 133, 173, 0.42))',
    },
  },
  hupu: {
    name: '虎扑',
    logo: "/sourcelogo/hupu.ico",
    header: {
      background: 'linear-gradient(90deg, rgba(229, 57, 53, 0.70), rgba(244, 67, 54, 0.40))',
    },
  },
  tencent: {
    name: '腾讯',
    logo: "/sourcelogo/tencent.ico",
    header: {
      background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.66), rgba(14, 165, 233, 0.36))',
    },
  },
  juejin: {
    name: '掘金',
    logo: "/sourcelogo/juejin.png",
    header: {
      background: 'linear-gradient(90deg, rgba(22, 163, 74, 0.45), rgba(56, 189, 248, 0.26))',
    },
  },
  thepaper: {
    name: '澎湃',
    logo: "/sourcelogo/thepaper.ico",
    header: {
      background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.50), rgba(99, 102, 241, 0.28))',
    },
  },
  douban: {
    name: '豆瓣',
    logo: "/sourcelogo/douban.ico",
    header: {
      background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.45), rgba(16, 185, 129, 0.26))',
    },
  },
  ifeng: {
    name: '凤凰网',
    logo: "/sourcelogo/ifeng.png",
    header: {
      background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.46), rgba(249, 115, 22, 0.26))',
    },
  },
  cnblog: {
    name: '博客园',
    logo: "/sourcelogo/cnblog.ico",
    capabilities: { iframe: false },
    header: {
      background: 'linear-gradient(90deg, rgba(148, 163, 184, 0.36), rgba(71, 85, 105, 0.22))',
    },
  },
  csdn: {
    name: 'CSDN',
    logo: "/sourcelogo/csdn.ico",
    header: {
      background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.50), rgba(244, 63, 94, 0.28))',
    },
  },
  github: {
    name: 'GitHub',
    logo: null,
    header: {
      background: 'linear-gradient(90deg, rgba(36, 41, 46, 0.62), rgba(47, 54, 61, 0.30))',
    },
  },
  v2ex: {
    name: 'V2EX',
    logo: null,
    header: {
      background: 'linear-gradient(90deg, rgba(30, 136, 229, 0.48), rgba(66, 165, 245, 0.26))',
    },
  },
  tieba: {
    name: '贴吧',
    logo: null,
    header: {
      background: 'linear-gradient(90deg, rgba(30, 136, 229, 0.48), rgba(33, 150, 243, 0.26))',
    },
  },
  _36kr: {
    name: '36氪',
    logo: "/sourcelogo/_36kr.ico",
    header: {
      background: 'linear-gradient(90deg, rgba(0, 188, 212, 0.45), rgba(0, 172, 193, 0.26))',
    },
  },
  ithome: {
    name: 'IT之家',
    logo: "/sourcelogo/ithome.ico",
    header: {
      background: 'linear-gradient(90deg, rgba(0, 152, 255, 0.56), rgba(0, 171, 255, 0.32))',
    },
  },
};

export const getSourceConfig = (src) => {
  const key = String(src || '').toLowerCase();
  return SOURCES[key] || null;
};

export const getSourceDisplayName = (src) => {
  const key = String(src || '').toLowerCase();
  return SOURCES[key]?.name || src;
};

export const getSourceCapabilities = (src) => {
  const key = String(src || '').toLowerCase();
  return SOURCES[key]?.capabilities || { iframe: true };
};

export const getSourceHeaderStyle = (src) => {
  const key = String(src || '').toLowerCase();
  return SOURCES[key]?.header || null;
};

export const getSourceLogo = (src, theme) => {
  const key = String(src || '').toLowerCase();
  const logo = SOURCES[key]?.logo;
  if (!logo) return null;
  if (typeof logo === 'string') return logo;
  const t = (theme || '').toLowerCase();
  return logo[t] || logo.dark || logo.light || logo.warm || null;
};

export const buildGroupIndex = () => {
  const map = {};
  for (const g of GROUPS) {
    if (Array.isArray(g.sources)) {
      for (const s of g.sources) {
        map[String(s).toLowerCase()] = g;
      }
    }
  }
  return map;
};
