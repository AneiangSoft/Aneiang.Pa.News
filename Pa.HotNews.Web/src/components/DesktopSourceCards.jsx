import { memo, useMemo } from 'react';
import SourceCard from './SourceCard';

function DesktopSourceCards({
  cards,
  q,
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
  const mapped = useMemo(() => {
    return (cards || []).map(({
      src,
      status,
      news,
      updatedTime,
      errorMsg,
      filtered,
      title,
      iframeSupported,
    }) => ({
      src,
      status,
      news,
      updatedTime,
      errorMsg,
      filtered,
      title,
      iframeSupported,
    }));
  }, [cards]);

  return (
    <>
      {mapped.map(({ src, status, news, updatedTime, errorMsg, filtered, title, iframeSupported }) => (
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
          highlightText={highlightText}
          retrySource={retrySource}
        />
      ))}
    </>
  );
}

export default memo(DesktopSourceCards);
