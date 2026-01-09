import { Empty } from 'antd';
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
}) {
  const q = (query || '').trim().toLowerCase();

  const cards = (displaySources || []).map(src => {
    const block = newsBySource?.[src];
    const status = block?.status || 'loading';
    const news = block?.list;
    const updatedTime = block?.updatedTime;
    const errorMsg = block?.error;
    const filtered = q
      ? (news || []).filter(n => (n?.title || '').toLowerCase().includes(q))
      : news;

    return {
      src,
      status,
      news,
      updatedTime,
      errorMsg,
      filtered,
      title: getChineseSourceName(src),
    };
  });

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

  return (
    <div className="news-grid">
      {cards
        // 搜索时：只展示“有匹配数据”的卡片（避免一堆空卡片）
        .filter(x => (q ? x.status !== 'success' || (x.filtered?.length ?? 0) > 0 : true))
        .map(({ src, status, news, updatedTime, errorMsg, filtered, title }) => (
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
