import React from 'react';
import { Button, ConfigProvider, Modal, Tooltip, Space } from 'antd';
import { CloseOutlined, DownloadOutlined } from '@ant-design/icons';

import './PosterModal.css';

export default function PosterModal({
  open,
  onClose,
  onDownload,
  downloading,
  children,
  width = 540,
}) {
  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            padding: 0,
            paddingContentHorizontal: 0,
            paddingContentVertical: 0,
            paddingLG: 0,
          },
        },
      }}
    >
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        title={null}
        closable={false}
        width={width}
        className="poster-modal"
        centered
        styles={{
          content: { padding: 0, background: 'transparent', boxShadow: 'none' },
          body: { padding: 0 },
          header: { display: 'none' },
          footer: { display: 'none' },
          wrapper: { padding: 0 },
          mask: { padding: 0 },
        }}
      >
        <div style={{ position: 'relative', margin: 0, padding: 0 }}>
          <div className="poster-fab">
            <Space.Compact>
              <Tooltip title="下载海报" placement="bottom">
                <Button
                  className="poster-fab-btn"
                  icon={<DownloadOutlined />}
                  type="text"
                  onClick={onDownload}
                  loading={downloading}
                />
              </Tooltip>

              <Tooltip title="关闭" placement="bottom">
                <Button
                  className="poster-fab-btn"
                  icon={<CloseOutlined />}
                  type="text"
                  onClick={onClose}
                />
              </Tooltip>
            </Space.Compact>
          </div>

          {children}
        </div>
      </Modal>
    </ConfigProvider>
  );
}
