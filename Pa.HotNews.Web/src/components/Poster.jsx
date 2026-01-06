import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';

import LogoDark from '../assets/logo-dark.svg';
import LogoLight from '../assets/logo-light.svg';
import LogoWarm from '../assets/logo-warm.svg';

// 简洁文本榜单海报：尽量不要依赖 antd，避免导出图片时字体/样式异常
const Poster = forwardRef(function Poster(
  {
    title,
    updatedTimeText,
    items = [],
    siteText,
    theme = 'dark',
    qrText,
  },
  ref
) {
  const themeTokens =
    theme === 'light'
      ? {
          bg: '#f6f7fb',
          text: 'rgba(15,23,42,0.92)',
          sub: 'rgba(71,85,105,0.88)',
          card: 'rgba(255,255,255,0.92)',
          border: 'rgba(15,23,42,0.10)',
          sep: 'rgba(15,23,42,0.12)',

          headerGrad:
            'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(124,58,237,0.16) 55%, rgba(219,39,119,0.16) 100%)',
          headerBorder: 'rgba(15,23,42,0.10)',
          badgeBg: 'rgba(37,99,235,0.12)',
          badgeText: '#2563eb',

          rankBg: 'rgba(37,99,235,0.12)',
          rankText: '#2563eb',
          topRankBg: 'rgba(219,39,119,0.14)',
          topRankText: '#db2777',

          noise:
            'radial-gradient(1200px 600px at 20% 0%, rgba(37,99,235,0.10), transparent 55%), radial-gradient(900px 520px at 95% 10%, rgba(219,39,119,0.10), transparent 55%)',
        }
      : theme === 'warm'
        ? {
            bg: '#12110f',
            text: 'rgba(255,252,245,0.92)',
            sub: 'rgba(203,193,176,0.90)',
            card: 'rgba(24,22,19,0.78)',
            border: 'rgba(203,193,176,0.14)',
            sep: 'rgba(203,193,176,0.18)',

            headerGrad:
              'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(251,146,60,0.14) 55%, rgba(239,68,68,0.12) 100%)',
            headerBorder: 'rgba(203,193,176,0.14)',
            badgeBg: 'rgba(217,119,6,0.16)',
            badgeText: '#f59e0b',

            rankBg: 'rgba(217,119,6,0.14)',
            rankText: '#f59e0b',
            topRankBg: 'rgba(239,68,68,0.14)',
            topRankText: '#ef4444',

            noise:
              'radial-gradient(1200px 600px at 18% 0%, rgba(245,158,11,0.12), transparent 58%), radial-gradient(900px 520px at 95% 10%, rgba(239,68,68,0.10), transparent 58%)',
          }
        : {
            bg: '#0b1220',
            text: 'rgba(248,250,252,0.92)',
            sub: 'rgba(148,163,184,0.88)',
            card: 'rgba(15,23,42,0.72)',
            border: 'rgba(148,163,184,0.12)',
            sep: 'rgba(148,163,184,0.18)',

            headerGrad:
              'linear-gradient(135deg, rgba(59,130,246,0.22) 0%, rgba(168,85,247,0.18) 55%, rgba(244,63,94,0.16) 100%)',
            headerBorder: 'rgba(148,163,184,0.14)',
            badgeBg: 'rgba(59,130,246,0.16)',
            badgeText: '#60a5fa',

            rankBg: 'rgba(59,130,246,0.18)',
            rankText: '#60a5fa',
            topRankBg: 'rgba(244,63,94,0.16)',
            topRankText: '#fb7185',

            noise:
              'radial-gradient(1200px 600px at 20% 0%, rgba(59,130,246,0.14), transparent 55%), radial-gradient(900px 520px at 95% 10%, rgba(244,63,94,0.12), transparent 55%)',
          };

  const logoSrc = { dark: LogoDark, light: LogoLight, warm: LogoWarm }[theme] || LogoDark;

  const [qrDataUrl, setQrDataUrl] = useState('');

  const effectiveQrText = useMemo(() => (qrText || '').trim(), [qrText]);

  useEffect(() => {
    let cancelled = false;

    const gen = async () => {
      try {
        const url = await QRCode.toDataURL(effectiveQrText, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 220,
          color: {
            dark: '#0B1220',
            light: '#FFFFFF',
          },
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) setQrDataUrl('');
      }
    };

    gen();
    return () => {
      cancelled = true;
    };
  }, [effectiveQrText]);

  const topBadgeText = 'HOT';

  return (
    <div
      ref={ref}
      style={{
        width: 860,
        padding: 28,
        borderRadius: 22,
        background: `${themeTokens.noise}, ${themeTokens.bg}`,
        color: themeTokens.text,
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 顶部渐变横幅（海报感） */}
      <div
        style={{
          borderRadius: 18,
          padding: 18,
          background: themeTokens.headerGrad,
          border: `1px solid ${themeTokens.headerBorder}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                background: themeTokens.card,
                border: `1px solid ${themeTokens.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '0 0 auto',
              }}
            >
              <img src={logoSrc} alt="logo" style={{ width: 42, height: 42, objectFit: 'contain' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.15 }}>{title}</div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: themeTokens.badgeBg,
                    color: themeTokens.badgeText,
                    border: `1px solid ${themeTokens.headerBorder}`,
                  }}
                >
                  {topBadgeText}
                </span>
              </div>

              <div style={{ marginTop: 8, fontSize: 13, color: themeTokens.sub }}>
                {updatedTimeText ? `更新时间：${updatedTimeText}` : ''}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: themeTokens.sub }}>{siteText}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: themeTokens.sub, opacity: 0.9 }}>
              热榜 · 趋势 · 速览
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, height: 1, background: themeTokens.sep, opacity: 0.8 }} />

      {/* 榜单卡片区 */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.slice(0, 10).map((it, idx) => {
          const isTop3 = idx < 3;
          const rankBg = isTop3 ? themeTokens.topRankBg : themeTokens.rankBg;
          const rankText = isTop3 ? themeTokens.topRankText : themeTokens.rankText;

          return (
            <div
              key={it.url || idx}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'baseline',
                padding: '12px 14px',
                borderRadius: 14,
                background: themeTokens.card,
                border: `1px solid ${themeTokens.border}`,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: rankBg,
                  color: rankText,
                  fontWeight: 900,
                  fontSize: 13,
                  flex: '0 0 auto',
                }}
              >
                {idx + 1}
              </div>

              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.38,
                  fontWeight: 650,
                  wordBreak: 'break-word',
                }}
              >
                {it.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部信息区：二维码更适合手机 */}
      <div
        style={{
          marginTop: 18,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 14,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          color: themeTokens.sub,
          fontSize: 12,
        }}
      >
        <div style={{ maxWidth: 560, lineHeight: 1.4 }}>
          提示：榜单数据来源于公开平台，仅供参考。
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            padding: 12,
            borderRadius: 16,
            background: themeTokens.card,
            border: `1px solid ${themeTokens.border}`,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 16,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flex: '0 0 auto',
            }}
          >
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="qrcode" style={{ width: 86, height: 86 }} />
            ) : (
              <div style={{ fontSize: 10, color: '#111827' }}>二维码生成失败</div>
            )}
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: themeTokens.text }}>手机扫码访问</div>
            <div style={{ marginTop: 6, fontSize: 12, color: themeTokens.sub }}>{effectiveQrText}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Poster;
