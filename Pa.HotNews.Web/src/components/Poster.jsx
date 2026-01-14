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
    renderItem,
    // 海报尺寸：默认按手机 9:16 设计（便于一屏预览 + 方便分享）
    size = 'mobile', // mobile | wide
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

  const layout =
    size === 'wide'
      ? {
          w: 760,
          pad: 20,
          radius: 18,
          headerPad: 14,
          headerRadius: 14,
          logoBox: 46,
          logoImg: 36,
          titleSize: 24,
          listTop: 12,
          listGap: 8,
          itemPad: '10px 12px',
          itemRadius: 12,
          rankBox: 28,
          rankRadius: 9,
          rankFont: 12,
          footerTop: 14,
          qrWrapPad: 10,
          qrWrapRadius: 14,
          qrBox: 84,
          qrImg: 74,
        }
      : {
          // mobile 9:16 (1080x1920 的等比缩小)
          w: 540,
          pad: 16,
          radius: 18,
          headerPad: 12,
          headerRadius: 14,
          logoBox: 42,
          logoImg: 32,
          titleSize: 22,
          listTop: 10,
          listGap: 8,
          itemPad: '9px 10px',
          itemRadius: 12,
          rankBox: 26,
          rankRadius: 9,
          rankFont: 12,
          footerTop: 12,
          qrWrapPad: 10,
          qrWrapRadius: 14,
          qrBox: 78,
          qrImg: 68,
        };

  return (
    <div
      ref={ref}
      style={{
        width: layout.w,
        padding: layout.pad,
        borderRadius: layout.radius,
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
          borderRadius: layout.headerRadius,
          padding: layout.headerPad,
          background: themeTokens.headerGrad,
          border: `1px solid ${themeTokens.headerBorder}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: layout.logoBox,
                height: layout.logoBox,
                borderRadius: 12,
                background: themeTokens.card,
                border: `1px solid ${themeTokens.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '0 0 auto',
              }}
            >
              <img
                src={logoSrc}
                alt="logo"
                style={{ width: layout.logoImg, height: layout.logoImg, objectFit: 'contain' }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ fontSize: layout.titleSize, fontWeight: 900, lineHeight: 1.15 }}>
                  {title}
                </div>
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

              <div style={{ marginTop: 6, fontSize: 12, color: themeTokens.sub }}>
                {updatedTimeText ? `更新时间：${updatedTimeText}` : ''}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: themeTokens.sub }}>{siteText}</div>
            <div style={{ marginTop: 6, fontSize: 11, color: themeTokens.sub, opacity: 0.9 }}>
              热榜 · 趋势 · 速览
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: layout.listTop, height: 1, background: themeTokens.sep, opacity: 0.8 }} />

      {/* 榜单卡片区 */}
      <div style={{ marginTop: layout.listTop, display: 'flex', flexDirection: 'column', gap: layout.listGap }}>
        {items.slice(0, size === 'mobile' ? 8 : 10).map((it, idx) => {
          const isTop3 = idx < 3;
          const rankBg = isTop3 ? themeTokens.topRankBg : themeTokens.rankBg;
          const rankText = isTop3 ? themeTokens.topRankText : themeTokens.rankText;

          return (
            <div
              key={it.url || idx}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'baseline',
                padding: layout.itemPad,
                borderRadius: layout.itemRadius,
                background: themeTokens.card,
                border: `1px solid ${themeTokens.border}`,
              }}
            >
              <div
                style={{
                  width: layout.rankBox,
                  height: layout.rankBox,
                  borderRadius: layout.rankRadius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: rankBg,
                  color: rankText,
                  fontWeight: 900,
                  fontSize: layout.rankFont,
                  flex: '0 0 auto',
                }}
              >
                {idx + 1}
              </div>

              {typeof renderItem === 'function' ? (
                renderItem(it, idx, themeTokens)
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.35,
                    fontWeight: 650,
                    wordBreak: 'break-word',
                  }}
                >
                  {it.title}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部信息区：二维码更适合手机 */}
      <div
        style={{
          marginTop: layout.footerTop,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          color: themeTokens.sub,
          fontSize: 11,
        }}
      >
        <div style={{ maxWidth: size === 'mobile' ? 320 : 460, lineHeight: 1.4 }}>
          提示：榜单数据来源于公开平台，仅供参考。
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            padding: layout.qrWrapPad,
            borderRadius: layout.qrWrapRadius,
            background: themeTokens.card,
            border: `1px solid ${themeTokens.border}`,
          }}
        >
          <div
            style={{
              width: layout.qrBox,
              height: layout.qrBox,
              borderRadius: 14,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flex: '0 0 auto',
            }}
          >
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="qrcode" style={{ width: layout.qrImg, height: layout.qrImg }} />
            ) : (
              <div style={{ fontSize: 10, color: '#111827' }}>二维码生成失败</div>
            )}
          </div>

          <div style={{ lineHeight: 1.2, maxWidth: size === 'mobile' ? 200 : 260 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: themeTokens.text }}>手机扫码访问</div>
            <div
              style={{
                marginTop: 5,
                fontSize: 11,
                color: themeTokens.sub,
                wordBreak: 'break-all',
              }}
            >
              {effectiveQrText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Poster;
