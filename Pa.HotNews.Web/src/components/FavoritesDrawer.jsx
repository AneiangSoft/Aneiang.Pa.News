import { Drawer, Empty, Space, Input, Select, List, Tooltip, Button } from 'antd';
import { DeleteOutlined, StarFilled } from '@ant-design/icons';
import './FavoritesDrawer.css';

function FavoritesDrawer({
  open,
  onClose,
  favoriteCount,
  filteredFavoriteList,
  favoriteSources,
  favQuery,
  setFavQuery,
  favSource,
  setFavSource,
  clearFavorites,
  readSet,
  linkBehavior,
  markAsRead,
  openReaderFromItem,
  toggleFavorite,
  getChineseSourceName,
  highlightText,
}) {
  return (
    <Drawer
      className="favorites-drawer"
      title={`收藏（${favoriteCount}）`}
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
      extra={
        <Button danger icon={<DeleteOutlined />} onClick={clearFavorites} disabled={favoriteCount === 0}>
          清空
        </Button>
      }
    >
      {favoriteCount === 0 ? (
        <Empty description="暂无收藏" />
      ) : (
        <>
          <Space className="fav-tools" direction="vertical" size={10} style={{ width: '100%' }}>
            <Input
              allowClear
              placeholder="在收藏中搜索标题..."
              value={favQuery}
              onChange={e => setFavQuery(e.target.value)}
            />
            <Select
              value={favSource}
              onChange={setFavSource}
              options={[
                { value: 'all', label: '全部来源' },
                ...favoriteSources.map(s => ({ value: s, label: getChineseSourceName(s) })),
              ]}
            />
          </Space>

          {filteredFavoriteList.length === 0 ? (
            <Empty description="没有匹配的收藏" style={{ marginTop: 24 }} />
          ) : (
            <List
              className="fav-list"
              style={{ marginTop: 12 }}
              dataSource={filteredFavoriteList}
              renderItem={fav => (
                <List.Item>
                  <Tooltip
                    title={fav.title}
                    placement="topLeft"
                    mouseEnterDelay={0.2}
                    overlayClassName="news-title-tooltip"
                  >
                    <a
                      href={fav.url}
                      target={linkBehavior === 'new-tab' ? '_blank' : undefined}
                      rel={linkBehavior === 'new-tab' ? 'noopener noreferrer' : undefined}
                      className={readSet.has(fav.url) ? 'is-read' : ''}
                      onClick={e => {
                        const openInNewTab = e.ctrlKey || e.metaKey;

                        if (linkBehavior === 'new-tab' || openInNewTab) {
                          e.preventDefault();
                          window.open(fav.url, '_blank', 'noopener,noreferrer');
                          return;
                        }

                        e.preventDefault();
                        markAsRead(fav.url);
                        openReaderFromItem({
                          url: fav.url,
                          title: fav.title,
                          source: fav.source,
                        });
                      }}
                    >
                      {highlightText(fav.title, favQuery)}
                    </a>
                  </Tooltip>
                  <button
                    type="button"
                    className="fav-btn is-fav"
                    title="取消收藏"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite({ url: fav.url, title: fav.title }, fav.source);
                    }}
                  >
                    <StarFilled />
                  </button>
                </List.Item>
              )}
            />
          )}
        </>
      )}
    </Drawer>
  );
}

export default FavoritesDrawer;
