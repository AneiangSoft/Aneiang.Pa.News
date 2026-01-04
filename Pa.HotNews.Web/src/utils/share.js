/**
 * 快捷分享：优先使用 Web Share API；不支持时降级为复制链接
 */
export async function quickShare({ title, text, url }) {
  const shareData = {
    title: title || document.title,
    text: text || '',
    url: url || location.href,
  };

  // Web Share API
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { ok: true, method: 'share' };
    } catch (e) {
      // 用户取消也会抛错：当作不致命
      return { ok: false, method: 'share', error: e };
    }
  }

  // 复制链接降级
  try {
    await copyText(shareData.url);
    return { ok: true, method: 'copy' };
  } catch (e) {
    return { ok: false, method: 'copy', error: e };
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  // 兼容降级：execCommand
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
  if (!ok) throw new Error('copy failed');
}

