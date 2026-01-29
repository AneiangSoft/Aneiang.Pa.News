let runtimeOverrides = null;
let runtimeLoadPromise = null;

const isPlainObject = (v) => {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
};

const normalizeSourceList = (v) => {
  if (v == null) return null;
  if (Array.isArray(v)) return v.map(s => String(s).toLowerCase()).filter(Boolean);
  if (typeof v === 'string') {
    return v
      .split(',')
      .map(s => String(s).trim().toLowerCase())
      .filter(Boolean);
  }
  return null;
};

const normalizeOverrides = (ovr) => {
  if (!isPlainObject(ovr)) return null;

  const out = { ...ovr };

  // 归一化 NEWS_UI.sourceManager.defaultOrder/defaultHidden/allowedSources（允许客户写大小写混合）
  if (isPlainObject(out.NEWS_UI) && isPlainObject(out.NEWS_UI.sourceManager)) {
    const sm = { ...out.NEWS_UI.sourceManager };
    if ('defaultOrder' in sm) {
      const list = normalizeSourceList(sm.defaultOrder);
      if (list) sm.defaultOrder = list;
    }
    if ('defaultHidden' in sm) {
      const list = normalizeSourceList(sm.defaultHidden);
      if (list) sm.defaultHidden = list;
    }
    if ('allowedSources' in sm) {
      const list = normalizeSourceList(sm.allowedSources);
      if (list) sm.allowedSources = list;
    }
    out.NEWS_UI = { ...out.NEWS_UI, sourceManager: sm };
  }

  return out;
};

// 兼容旧简化格式：
// {
//   "defaultOrder": ["weibo"],
//   "defaultHidden": ["tieba"],
//   "defaultGroupKey": "hot"
// }
const buildOverridesFromLegacyJson = (json) => {
  if (!json || typeof json !== 'object') return null;

  const defaultOrder = normalizeSourceList(json.defaultOrder);
  const defaultHidden = normalizeSourceList(json.defaultHidden);
  const defaultGroupKey = json.defaultGroupKey != null ? String(json.defaultGroupKey) : null;

  if (!defaultOrder && !defaultHidden && !defaultGroupKey) return null;

  const NEWS_UI = {
    sourceManager: {
      ...(defaultOrder ? { defaultOrder } : null),
      ...(defaultHidden ? { defaultHidden } : null),
    },
    tabs: {
      ...(defaultGroupKey ? { defaultGroupKey } : null),
    },
  };

  return { NEWS_UI };
};

const buildOverridesFromJson = (json) => {
  // 新格式（推荐）：与 defaults 同结构，支持部分覆盖
  // {
  //   "NEWS_UI": { ... },
  //   "GROUPS": [ ... ],
  //   "SOURCES": { ... }
  // }
  if (isPlainObject(json) && (json.NEWS_UI || json.GROUPS || json.SOURCES)) {
    return normalizeOverrides({
      ...(json.NEWS_UI ? { NEWS_UI: json.NEWS_UI } : null),
      ...(json.GROUPS ? { GROUPS: json.GROUPS } : null),
      ...(json.SOURCES ? { SOURCES: json.SOURCES } : null),
    });
  }

  // 旧格式兼容
  return buildOverridesFromLegacyJson(json);
};

export const loadRuntimeConfig = async () => {
  if (typeof window === 'undefined') return null;
  if (runtimeLoadPromise) return runtimeLoadPromise;

  runtimeLoadPromise = (async () => {
    try {
      const res = await fetch('/config.json', { cache: 'no-store' });
      if (!res.ok) return null;
      const json = await res.json();
      runtimeOverrides = buildOverridesFromJson(json);
      return runtimeOverrides;
    } catch (_) {
      return null;
    }
  })();

  return runtimeLoadPromise;
};

export const getRuntimeOverrides = () => runtimeOverrides;
