import { Card, List, Button, Tooltip, Space, Spin, Empty, Tag } from 'antd';
import {
  SyncOutlined,
  CopyOutlined,
  ShareAltOutlined,
  StarOutlined,
  StarFilled,
  StopOutlined,
} from '@ant-design/icons';

import './SourceCard.css';

function SourceCard({
  src,
  title,
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
  const shouldOpenInNewTab = linkBehavior === 'new-tab' || (linkBehavior === 'in-app' && !iframeSupported);

  return (
    <Card
      key={src}
      title={
        <span className="card-title">
          <span className="card-title-text">{title}</span>
          {linkBehavior === 'in-app' && !iframeSupported ? (
            <Tooltip title="该来源可能无法站内阅读，点击将直接在新标签页打开（也可 Ctrl/⌘ + 点击标题）">
              <Tag className="card-title-tag is-subtle" icon={<StopOutlined />}>
                站内受限
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
          <List
            className="news-list"
            dataSource={filtered}
            renderItem={(item, idx) => (
              <List.Item>
                <span className="news-rank">{idx + 1}</span>

                <Tooltip
                  title={item.title}
                  placement="topLeft"
                  mouseEnterDelay={0.2}
                  overlayClassName="news-title-tooltip"
                >
                  <a
                    href={item.url}
                    target={shouldOpenInNewTab ? '_blank' : undefined}
                    rel={shouldOpenInNewTab ? 'noopener noreferrer' : undefined}
                    className={readSet.has(item.url) ? 'is-read' : ''}
                    onClick={e => {
                      // 当选择“站内阅读”时：支持 Ctrl/⌘ + 点击新标签页打开
                      const openInNewTab = e.ctrlKey || e.metaKey;

                      // 1) 用户偏好为“新标签页”
                      // 2) 用户按住 Ctrl/⌘
                      // 3) 当前来源不支持站内阅读（站内模式下）
                      // 以上任一情况：都强制新标签页打开
                      if (shouldOpenInNewTab || openInNewTab) {
                        e.preventDefault();
                        window.open(item.url, '_blank', 'noopener,noreferrer');
                        return;
                      }

                      e.preventDefault();
                      markAsRead(item.url);
                      onOpenItem({ url: item.url, title: item.title, source: src });
                    }}
                  >
                    {highlightText(item.title, q)}
                  </a>
                </Tooltip>

                <button
                  type="button"
                  className={isFavorited(item.url) ? 'fav-btn is-fav' : 'fav-btn'}
                  title={isFavorited(item.url) ? '取消收藏' : '收藏'}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(item, src);
                  }}
                >
                  {isFavorited(item.url) ? <StarFilled /> : <StarOutlined />}
                </button>
              </List.Item>
            )}
          />
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

export default SourceCard;
