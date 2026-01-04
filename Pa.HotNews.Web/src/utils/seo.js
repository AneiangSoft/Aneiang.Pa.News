// 仅做轻量 SEO：在 SPA 里更新 title/description/keywords/canonical

const DEFAULT_TITLE = 'Aneiang 热榜聚合 - 全网热点实时聚合';
const DEFAULT_DESC =
  'Aneiang 热榜聚合：实时汇总知乎、微博、抖音、头条、B站、掘金、GitHub 等全网热榜，支持搜索、收藏与主题切换。';

function setMetaByName(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkRel(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function updateSeo({ query }) {
  const q = String(query || '').trim();

  // Title
  document.title = q ? `${q} - Aneiang 热榜聚合` : DEFAULT_TITLE;

  // Description（搜索时更贴近意图）
  const desc = q ? `搜索“${q}” - Aneiang 热榜聚合（全网热点实时聚合）` : DEFAULT_DESC;
  setMetaByName('description', desc);

  // Keywords（轻量，不追求权重，只做补全）
  const baseKeywords = ['热榜', '热点', '聚合', '知乎热榜', '微博热搜', '抖音热榜', '头条热榜', 'B站热榜', 'GitHub Trending'];
  const keywords = q ? [q, ...baseKeywords].join(',') : baseKeywords.join(',');
  setMetaByName('keywords', keywords);

  // Canonical（带/不带 query 的版本：建议 canonical 去掉 query，避免重复收录）
  try {
    const url = new URL(location.href);
    url.search = '';
    setLinkRel('canonical', url.toString());
  } catch {
    // ignore
  }
}

