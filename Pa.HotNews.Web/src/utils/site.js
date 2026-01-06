// 站点相关工具：动态获取当前域名/站点信息

/**
 * 获取当前站点 origin（协议+域名+端口）
 * - 生产：例如 https://news.aneiang.com
 * - 开发：例如 http://localhost:5173
 */
export function getSiteOrigin() {
  try {
    return window.location.origin;
  } catch {
    return '';
  }
}

/**
 * 获取当前站点 hostname（域名+端口不含协议）
 * - 生产：news.aneiang.com
 * - 开发：localhost:5173
 */
export function getSiteHost() {
  try {
    return window.location.host;
  } catch {
    return '';
  }
}

/**
 * 获取站点绝对 URL
 */
export function toAbsoluteUrl(pathname = '/') {
  const origin = getSiteOrigin();
  if (!origin) return pathname;
  if (!pathname) return origin;
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) return pathname;
  return origin.replace(/\/$/, '') + (pathname.startsWith('/') ? pathname : `/${pathname}`);
}

