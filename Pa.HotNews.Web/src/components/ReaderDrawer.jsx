import { Drawer, Button, Tooltip, Empty, Space } from 'antd';
import { ReloadOutlined, LinkOutlined, CopyOutlined } from '@ant-design/icons';

function ReaderDrawer({
  open,
  item,
  onClose,
  onReload,
  onOpenInNewTab,
  onCopyLink,
  iframeKey,
  embedBlocked,
  onIframeLoad,
  onIframeError,
  prevItem,
  nextItem,
  onPrev,
  onNext,
  getChineseSourceName,
  headerLoading,
}) {
  return (
    <Drawer
      className="reader-drawer"
      title={null}
      closeIcon={null}
      placement="bottom"
      height="100%"
      open={open}
      onClose={onClose}
      styles={{
        header: { display: 'none' },
        body: { padding: 0 },
      }}
    >
      {/* 自定义阅读 Header */}
      <div className="reader-header">
        <div className="reader-header-main">
          <div className="reader-title" title={item?.title || ''}>
            {item?.title || '站内阅读'}
          </div>
          <div className="reader-subtitle">
            <span className="reader-source">
              {item?.source ? getChineseSourceName(item.source) : ''}
            </span>
            {item?.url ? <span className="reader-url" title={item.url}>{item.url}</span> : null}
            {headerLoading ? <span className="reader-loading-text">加载中…</span> : null}
          </div>
        </div>

        <div className="reader-header-actions">
          <Tooltip title="上一条">
            <Button type="text" disabled={!prevItem} onClick={onPrev}>
              上一条
            </Button>
          </Tooltip>

          <Tooltip title="下一条">
            <Button type="text" disabled={!nextItem} onClick={onNext}>
              下一条
            </Button>
          </Tooltip>

          <Tooltip title="关闭">
            <Button type="text" onClick={onClose}>
              关闭
            </Button>
          </Tooltip>

          <Tooltip title="重新加载">
            <Button type="text" icon={<ReloadOutlined />} onClick={onReload} />
          </Tooltip>

          <Tooltip title="在新标签页中打开">
            <Button type="text" icon={<LinkOutlined />} onClick={onOpenInNewTab} />
          </Tooltip>

          <Tooltip title="复制链接">
            <Button type="text" icon={<CopyOutlined />} onClick={onCopyLink} />
          </Tooltip>
        </div>
      </div>

      <div className="reader-body">
        {item?.url ? (
          <div className="reader-iframe-container">
            {embedBlocked ? (
              <div className="reader-blocked">
                <div className="reader-blocked-title">该站点不支持站内阅读</div>
                <div className="reader-blocked-desc">
                  目标网站可能设置了安全策略（X-Frame-Options / CSP），禁止被嵌入到 iframe。
                  你可以点击下方按钮在新标签页打开原文。
                  <div className="reader-blocked-tip">
                    小技巧：也可以按住 Ctrl（macOS 为 ⌘）再点击标题，快速在新标签页打开。
                  </div>
                </div>

                <Space style={{ marginTop: 16 }}>
                  <Button type="primary" icon={<LinkOutlined />} onClick={onOpenInNewTab}>
                    在新标签页打开
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={onReload}>
                    重试
                  </Button>
                </Space>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                src={item.url}
                title={item.title || '站内阅读'}
                className="reader-iframe"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                allowFullScreen
                onLoad={onIframeLoad}
                onError={onIframeError}
              />
            )}
          </div>
        ) : (
          <div className="reader-empty">
            <Empty description="未选择文章" />
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default ReaderDrawer;
