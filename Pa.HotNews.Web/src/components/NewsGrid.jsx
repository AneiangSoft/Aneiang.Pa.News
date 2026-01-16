import { useEffect, useMemo, useState } from 'react';
import { Empty, Drawer, Input, Button, Grid } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import SourceCard from './SourceCard';

function NewsGrid({
  displaySources,
  newsBySource,
  getChineseSourceName,
  query,
  readSet,
  linkBehavior,
  openReaderFromItem,
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
  noIframeSources,
}) {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = (screens.md === false);
  const q = (query || '').trim().toLowerCase();

  // 手机端来源选择器状态（Hook 必须始终调用，不能放在任何 return 之后）
  const [activeSrc, setActiveSrc] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('');

  const cards = (displaySources || []).map(src => {
    const block = newsBySource?.[src];
    const status = block?.status || 'loading';
    const news = block?.list;
    const updatedTime = block?.updatedTime;
    const errorMsg = block?.error;
    const filtered = q
      ? (news || []).filter(n => (n?.title || '').toLowerCase().includes(q))
      : news;

    const iframeSupported = !(noIframeSources && noIframeSources.has(String(src).toLowerCase()));

    return {
      src,
      status,
      news,
      updatedTime,
      errorMsg,
      filtered,
      title: getChineseSourceName(src),
      iframeSupported,
    };
  });

  const visibleCards = cards
    // 搜索时：只展示“有匹配数据”的卡片（避免一堆空卡片）
    .filter(x => (q ? x.status !== 'success' || (x.filtered?.length ?? 0) > 0 : true));

  // 当可见来源变化（比如隐藏/白名单/搜索导致变化）时，确保 activeSrc 合法
  useEffect(() => {
    if (!isMobile) return;
    if (!visibleCards.length) {
      if (activeSrc !== null) setActiveSrc(null);
      return;
    }
    const exists = visibleCards.some(x => x.src === activeSrc);
    if (!exists) setActiveSrc(visibleCards[0].src);
  }, [isMobile, activeSrc, visibleCards]);

  const activeCard = isMobile
    ? (visibleCards.find(x => x.src === activeSrc) || visibleCards[0])
    : null;

  const filteredSources = useMemo(() => {
    if (!isMobile) return [];
    const f = (sourceFilter || '').trim().toLowerCase();
    if (!f) return visibleCards;
    return visibleCards.filter(x => {
      const src = String(x.src || '').toLowerCase();
      const title = String(x.title || '').toLowerCase();
      return src.includes(f) || title.includes(f);
    });
  }, [isMobile, sourceFilter, visibleCards]);

  // 搜索中：若所有“成功卡片”都无匹配（且至少有一个成功卡片），则显示友好空状态
  if (q) {
    const successCards = cards.filter(x => x.status === 'success');
    const hasAnyMatch = successCards.some(x => (x.filtered?.length ?? 0) > 0);

    if (successCards.length > 0 && !hasAnyMatch) {
      return (
        <div className="news-grid">
          <div style={{ gridColumn: '1 / -1', padding: '60px 0' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
                    没有找到与“{query.trim()}”相关的内容
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    试试更换关键词，或清空搜索
                  </div>
                </div>
              }
            />
          </div>
        </div>
      );
    }
  }

  // 手机端：来源选择器 + 单来源展示
  if (isMobile) {
    return (
      <div className="news-grid">
        <div style={{ gridColumn: '1 / -1', marginBottom: 10 }}>
          <Button
            type="default"
            block
            onClick={() => setPickerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeCard ? activeCard.title : '选择来源'}
            </span>
            <DownOutlined />
          </Button>
        </div>

        {activeCard ? (
          <SourceCard
            key={activeCard.src}
            src={activeCard.src}
            title={activeCard.title}
            status={activeCard.status}
            news={activeCard.news}
            filtered={activeCard.filtered}
            updatedTime={activeCard.updatedTime}
            errorMsg={activeCard.errorMsg}
            q={q}
            iframeSupported={activeCard.iframeSupported}
            readSet={readSet}
            linkBehavior={linkBehavior}
            onOpenItem={openReaderFromItem}
            markAsRead={markAsRead}
            isFavorited={isFavorited}
            toggleFavorite={toggleFavorite}
            copySnapshot={copySnapshot}
            generatePoster={generatePoster}
            isGeneratingPoster={isGeneratingPoster}
            getFullTimeString={getFullTimeString}
            formatTime={formatTime}
            highlightText={(t) => highlightText(t, query)}
            retrySource={retrySource}
          />
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '24px 0' }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无可用来源" />
          </div>
        )}

        <Drawer
          title="选择来源"
          placement="bottom"
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          styles={{ body: { paddingTop: 12 } }}
        >
          <Input
            allowClear
            value={sourceFilter}
            placeholder="搜索来源..."
            onChange={e => setSourceFilter(e.target.value)}
            style={{ marginBottom: 12 }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredSources.map(x => {
              const active = x.src === activeSrc;
              return (
                <Button
                  key={x.src}
                  type={active ? 'primary' : 'default'}
                  block
                  onClick={() => {
                    setActiveSrc(x.src);
                    setPickerOpen(false);
                  }}
                  style={{
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                  }}
                >
                  {x.title}
                </Button>
              );
            })}
          </div>
        </Drawer>
      </div>
    );
  }

  // 桌面端：保持现有“多来源卡片纵向/网格”展示
  return (
    <div className="news-grid">
      {visibleCards.map(({ src, status, news, updatedTime, errorMsg, filtered, title, iframeSupported }) => (
        <SourceCard
          key={src}
          src={src}
          title={title}
          status={status}
          news={news}
          filtered={filtered}
          updatedTime={updatedTime}
          errorMsg={errorMsg}
          q={q}
          iframeSupported={iframeSupported}
          readSet={readSet}
          linkBehavior={linkBehavior}
          onOpenItem={openReaderFromItem}
          markAsRead={markAsRead}
          isFavorited={isFavorited}
          toggleFavorite={toggleFavorite}
          copySnapshot={copySnapshot}
          generatePoster={generatePoster}
          isGeneratingPoster={isGeneratingPoster}
          getFullTimeString={getFullTimeString}
          formatTime={formatTime}
          highlightText={(t) => highlightText(t, query)}
          retrySource={retrySource}
        />
      ))}
    </div>
  );
}

export default NewsGrid;
