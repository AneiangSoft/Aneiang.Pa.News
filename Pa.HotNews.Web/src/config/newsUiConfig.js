import { GROUPS_DEFAULTS, NEWS_UI_DEFAULTS, SOURCES_DEFAULTS } from './newsUiConfig.defaults';
import { getRuntimeOverrides as getRuntimeOverridesFromJson } from './runtimeConfig';

export const getRuntimeOverrides = () => {
  if (typeof window === 'undefined') return null;
  return getRuntimeOverridesFromJson() || window.__HOTNEWS_CONFIG__ || window.hotNewsConfig || null;
};

const isPlainObject = (v) => {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
};

export const deepMerge = (base, override) => {
  if (override === undefined) return base;
  if (Array.isArray(base) || Array.isArray(override)) return override;
  if (!isPlainObject(base) || !isPlainObject(override)) return override;

  const out = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = deepMerge(base[k], override[k]);
  }
  return out;
};

export const NEWS_UI = NEWS_UI_DEFAULTS;
export const GROUPS = GROUPS_DEFAULTS;
export const SOURCES = SOURCES_DEFAULTS;

export const getNewsUiConfig = () => {
  const overrides = getRuntimeOverrides() || {};
  return {
    NEWS_UI: deepMerge(NEWS_UI_DEFAULTS, overrides.NEWS_UI),
    GROUPS: deepMerge(GROUPS_DEFAULTS, overrides.GROUPS),
    SOURCES: deepMerge(SOURCES_DEFAULTS, overrides.SOURCES),
  };
};

export const getSourceConfig = (src) => {
  const { SOURCES } = getNewsUiConfig();
  const key = String(src || '').toLowerCase();
  return SOURCES[key] || null;
};

export const getSourceDisplayName = (src) => {
  const { SOURCES } = getNewsUiConfig();
  const key = String(src || '').toLowerCase();
  return SOURCES[key]?.name || src;
};

export const getSourceCapabilities = (src) => {
  const { SOURCES } = getNewsUiConfig();
  const key = String(src || '').toLowerCase();
  return SOURCES[key]?.capabilities || { iframe: true };
};

export const getSourceHeaderStyle = (src) => {
  const { SOURCES } = getNewsUiConfig();
  const key = String(src || '').toLowerCase();
  return SOURCES[key]?.header || null;
};

export const getSourceLogo = (src, theme) => {
  const { SOURCES } = getNewsUiConfig();
  const key = String(src || '').toLowerCase();
  const logo = SOURCES[key]?.logo;
  if (!logo) return null;
  if (typeof logo === 'string') return logo;
  const t = (theme || '').toLowerCase();
  return logo[t] || logo.dark || logo.light || logo.warm || null;
};

export const buildGroupIndex = () => {
  const { GROUPS } = getNewsUiConfig();
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
