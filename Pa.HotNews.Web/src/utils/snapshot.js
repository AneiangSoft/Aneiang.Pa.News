import { getFullTimeString } from './formatTime';

/**
 * 生成榜单快照（Markdown）
 * @param {object} opts
 * @param {string} opts.title 标题（如：知乎）
 * @param {Array<{title:string,url:string}>} opts.items 条目
 * @param {string|Date|null} [opts.updatedTime] 更新时间
 * @param {number} [opts.limit=10] 条数
 */
export function generateSnapshot({ title, items, updatedTime, limit = 10 }) {
  const list = Array.isArray(items) ? items : [];
  const time = updatedTime ? `（更新：${getFullTimeString(updatedTime)}）` : '';

  const lines = [];
  lines.push(`## ${title}${time}`);
  lines.push('');

  const take = list.slice(0, Math.max(0, limit));
  take.forEach((it, idx) => {
    const t = (it?.title || '').replace(/\s+/g, ' ').trim();
    const u = it?.url || '';
    if (!t || !u) return;
    lines.push(`- ${idx + 1}. [${escapeMd(t)}](${u})`);
  });

  if (lines.length === 2) {
    lines.push('- （暂无数据）');
  }

  return lines.join('\n');
}

function escapeMd(s) {
  // 仅做最基础的转义，避免标题中的 ] ( 等破坏 markdown 链接
  return String(s).replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

