import { message } from 'antd';

/**
 * 更现代/更稳的复制实现：
 * 1) 优先 navigator.clipboard（安全上下文）
 * 2) 失败则降级到 textarea + execCommand（兼容老浏览器）
 */
export async function copyText(text, { successMsg = '已复制', failMsg = '复制失败' } = {}) {
  if (!text) {
    message.error(failMsg);
    return false;
  }

  // 优先：Clipboard API
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      if (successMsg) message.success(successMsg);
      return true;
    }
  } catch {
    // ignore
  }

  // 降级：execCommand
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

    if (ok) {
      if (successMsg) message.success(successMsg);
      return true;
    }
  } catch {
    // ignore
  }

  message.error(failMsg);
  return false;
}
