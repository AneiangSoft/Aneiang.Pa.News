import React, { forwardRef } from 'react';
import AneiangLogo from '../assets/Aneiang.png';

// 简洁文本榜单海报：尽量不要依赖 antd，避免导出图片时字体/样式异常
const Poster = forwardRef(function Poster(
  {
    title,
    updatedTimeText,
    items = [],
    siteText = 'news.aneiang.com',
    theme = 'dark',
  },
  ref
) {
    const themeTokens =
    theme === 'light'
      ? {
          bg: '#f6f7fb',
          card: 'rgba(255,255,255,0.92)',
          border: 'rgba(15,23,42,0.10)',
          text: 'rgba(15,23,42,0.92)',
          sub: 'rgba(71,85,105,0.88)',
          rankBg: 'rgba(37,99,235,0.12)',
          rankText: '#2563eb',
          sep: 'rgba(15,23,42,0.12)',
        }
      : theme === 'warm'
        ? {
            bg: '#12110f',
            card: 'rgba(24,22,19,0.78)',
            border: 'rgba(203,193,176,0.14)',
            text: 'rgba(255,252,245,0.92)',
            sub: 'rgba(203,193,176,0.90)',
            rankBg: 'rgba(217,119,6,0.14)',
            rankText: '#d97706',
            sep: 'rgba(203,193,176,0.18)',
          }
        : {
            bg: '#0b1220',
            card: 'rgba(15,23,42,0.72)',
            border: 'rgba(148,163,184,0.12)',
            text: 'rgba(248,250,252,0.92)',
            sub: 'rgba(148,163,184,0.88)',
            rankBg: 'rgba(59,130,246,0.18)',
            rankText: '#60a5fa',
            sep: 'rgba(148,163,184,0.18)',
          };

  return (
    <div
      ref={ref}
      style={{
        width: 860,
        padding: 28,
        borderRadius: 18,
        background: themeTokens.bg,
        color: themeTokens.text,
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={AneiangLogo}
            alt="logo"
            style={{ width: 36, height: 36, objectFit: 'contain', flex: '0 0 auto' }}
          />
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: themeTokens.sub }}>
              {updatedTimeText ? `更新时间：${updatedTimeText}` : ''}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: themeTokens.sub }}>{siteText}</div>
      </div>

      <div style={{ marginTop: 18, height: 1, background: themeTokens.sep }} />

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.slice(0, 10).map((it, idx) => (
          <div
            key={it.url || idx}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'baseline',
              padding: '10px 12px',
              borderRadius: 12,
              background: themeTokens.card,
              border: `1px solid ${themeTokens.border}`,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeTokens.rankBg,
                color: themeTokens.rankText,
                fontWeight: 800,
                fontSize: 13,
                flex: '0 0 auto',
              }}
            >
              {idx + 1}
            </div>
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.35,
                fontWeight: 650,
                wordBreak: 'break-word',
              }}
            >
              {it.title}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, fontSize: 12, color: themeTokens.sub }}>
        提示：榜单数据来源于公开平台，仅供参考。
      </div>
    </div>
  );
});

export default Poster;

