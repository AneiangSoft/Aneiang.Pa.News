import React from 'react';

/**
 * 高亮文本中匹配的关键词（大小写不敏感）
 * @param {string} text 原文本
 * @param {string} keyword 关键词
 * @returns {React.ReactNode}
 */
export function highlightText(text, keyword) {
  const raw = String(text ?? '');
  const k = String(keyword ?? '').trim();
  if (!raw || !k) return raw;

  // 转义正则特殊字符
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'ig');

  const parts = raw.split(re);
  const matches = raw.match(re);
  if (!matches) return raw;

  const nodes = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) nodes.push(<React.Fragment key={`t-${i}`}>{parts[i]}</React.Fragment>);
    if (i < matches.length) {
      nodes.push(
        <mark className="hl" key={`m-${i}`}>
          {matches[i]}
        </mark>
      );
    }
  }
  return nodes;
}

