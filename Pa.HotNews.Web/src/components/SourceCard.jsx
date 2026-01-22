import { memo } from 'react';
import { Card, Button, Tooltip, Space, Spin, Empty, Tag } from 'antd';
import VirtualList from 'rc-virtual-list';
import {
  SyncOutlined,
  CopyOutlined,
  ShareAltOutlined,
  StarOutlined,
  StarFilled,
  StopOutlined,
} from '@ant-design/icons';

import { NEWS_UI, getSourceHeaderStyle, getSourceCapabilities, getSourceLogo } from '../config/newsUiConfig';
import './SourceCard.css';

function SourceCard({
  src,
  title,
  theme,
  status,
  news,
  filtered,
  updatedTime,
  errorMsg,
  q,
  readSet,
  linkBehavior,
  onOpenItem,
  markAsRead,
  isFavorited,
  toggleFavorite,
  copySnapshot,
  generatePoster,
  isGeneratingPoster,
  getFullTimeString,
  formatTime,
  highlightText,
  retrySource,
  // 是否支持站内阅读（iframe）
  iframeSupported = true,
}) {
  const caps = getSourceCapabilities(src);
  const computedIframeSupported = iframeSupported && (caps?.iframe !== false);
  const shouldOpenInNewTab = linkBehavior === 'new-tab' || (linkBehavior === 'in-app' && !computedIframeSupported);

  const headerStyle = getSourceHeaderStyle(src);
  const logoSrc = getSourceLogo(src, theme);
  const headStyle = headerStyle ? { '--source-head-bg': headerStyle.background } : undefined;

  return (
    <Card
      key={src}
      style={headStyle}
      title={
        <span className="card-title">
          {logoSrc ? (
            <img
              className="card-title-logo"
              src={logoSrc}
              alt=""
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <span className="card-title-text">{title}</span>
          {linkBehavior === 'in-app' && !computedIframeSupported ? (
            <Tooltip title={NEWS_UI?.i18n?.iframeBlockedTip || '该来源可能无法站内阅读，点击将直接在新标签页打开（也可 Ctrl/⌘ + 点击标题）'}>
              <Tag className="card-title-tag is-subtle" icon={<StopOutlined />}>
                {NEWS_UI?.i18n?.iframeBlockedTag || '站内受限'}
              </Tag>
            </Tooltip>
          ) : null}
        </span>
      }
      extra={
        <span className="card-extra">
          {status === 'error' ? (
            <Tooltip title={errorMsg || '加载失败'}>
              <span className="card-error-label">加载失败</span>
            </Tooltip>
          ) : updatedTime ? (
            <span className="card-updated" title={getFullTimeString(updatedTime)}>
              {formatTime(updatedTime)}
            </span>
          ) : null}

          {q && status === 'success' ? (
            <span className="card-extra-count">{`${filtered.length} / ${(news || []).length}`}</span>
          ) : null}

          {status === 'success' && (
            <Space size={2}>
              <Tooltip title="复制快照">
                <Button
                  type="text"
                  size="small"
                  className="card-action-btn"
                  icon={<CopyOutlined />}
                  onClick={e => {
                    e.stopPropagation();
                    copySnapshot({
                      title,
                      items: news,
                      updatedTime,
                    });
                  }}
                />
              </Tooltip>

              <Tooltip title="生成海报">
                <Button
                  type="text"
                  size="small"
                  className="card-action-btn"
                  icon={<ShareAltOutlined />}
                  loading={isGeneratingPoster}
                  onClick={e => {
                    e.stopPropagation();
                    generatePoster(src, news || [], updatedTime);
                  }}
                />
              </Tooltip>
            </Space>
          )}
        </span>
      }
      className={`source-card status-${status}`}
      data-source={src.toLowerCase()}
    >
      {status === 'error' ? (
        <div className="card-state-body">
          <div className="card-error-visual" aria-hidden="true">
            <img className="card-error-img" src="/error.svg" alt="" />
          </div>

          <div className="card-error-text">加载失败</div>

          <div className="card-error-actions">
            <Button size="small" icon={<SyncOutlined />} onClick={() => retrySource(src)}>
              重试该来源
            </Button>
          </div>

          <div className="card-error-hint">提示：可能是接口限流/网络波动，稍等片刻再试。</div>
        </div>
      ) : status === 'success' ? (
        filtered?.length ? (
          <div className="news-list news-list-virtual news-list-fade">
            <VirtualList
              data={filtered}
              height={NEWS_UI?.list?.virtualHeight || 420}
              itemHeight={NEWS_UI?.list?.virtualItemHeight || 36}
              itemKey={(item, index) => item?.url || `${src}-${index}`}
            >
              {(item, idx) => {
                const url = item?.url;
                const isRead = url ? readSet.has(url) : false;
                const fav = url ? isFavorited(url) : false;

                return (
                  <div className="ant-list-item">
                    <span className="news-rank">{idx + 1}</span>

                    <Tooltip
                      title={item.title}
                      placement="topLeft"
                      mouseEnterDelay={0.2}
                    >
                      <a
                        href={url}
                        target={shouldOpenInNewTab ? '_blank' : undefined}
                        rel={shouldOpenInNewTab ? 'noopener noreferrer' : undefined}
                        className={isRead ? 'is-read' : ''}
                        onClick={e => {
                          const openInNewTab = e.ctrlKey || e.metaKey;

                          if (shouldOpenInNewTab || openInNewTab) {
                            e.preventDefault();
                            if (url) window.open(url, '_blank', 'noopener,noreferrer');
                            return;
                          }

                          if (!url) return;
                          e.preventDefault();
                          markAsRead(url);
                          onOpenItem({ url, title: item.title, source: src });
                        }}
                      >
                        {highlightText(item.title, q)}
                      </a>
                    </Tooltip>

                    <button
                      type="button"
                      className={fav ? 'fav-btn is-fav' : 'fav-btn'}
                      title={fav ? '取消收藏' : '收藏'}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item, src);
                      }}
                    >
                      {fav ? <StarFilled /> : <StarOutlined />}
                    </button>
                  </div>
                );
              }}
            </VirtualList>
          </div>
        ) : (
          <div className="card-state-body">
            <Empty description={q ? '没有匹配结果' : '暂无数据'} />
          </div>
        )
      ) : (
        <div className="card-state-body">
          <Spin size="small" />
          <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>加载中...</span>
        </div>
      )}
    </Card>
  );
}

export default memo(SourceCard);
