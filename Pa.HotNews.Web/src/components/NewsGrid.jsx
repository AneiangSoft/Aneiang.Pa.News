import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Drawer, Input, Button, Grid } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import SourceCard from './SourceCard';
import DesktopGroupTabs from './DesktopGroupTabs';
import DesktopSourceCards from './DesktopSourceCards';
import { GROUPS, NEWS_UI, buildGroupIndex } from '../config/newsUiConfig';
import './NewsGrid.css';

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
  const groupIndex = useMemo(() => buildGroupIndex(), []);
  const GROUP_ORDER = useMemo(() => GROUPS.map(g => g.label), []);

  const getGroupOfSource = useMemo(() => {
    const otherLabel = GROUPS.find(x => x.key === 'other')?.label || '其他';
    return (src) => {
      const key = String(src || '').toLowerCase();
      const g = groupIndex[key];
      return g?.label || otherLabel;
    };
  }, [groupIndex]);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = (screens.md === false);
  const q = (query || '').trim().toLowerCase();

  const highlightTitle = useCallback((t) => highlightText(t, query), [highlightText, query]);

  // 手机端来源选择器状态（Hook 必须始终调用，不能放在任何 return 之后）
  const [activeSrc, setActiveSrc] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('');

  // 切换动效：仅控制 wrapper 的 class
  const [animDir, setAnimDir] = useState(null); // 'left' | 'right' | null
  const animTimerRef = useRef(null);

  // 轻量 swipe 状态：只在手机端生效
  const swipeRef = useRef({ x0: 0, y0: 0, dx: 0, dy: 0, active: false });

  const cards = useMemo(() => {
    return (displaySources || []).map(src => {
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
  }, [displaySources, newsBySource, q, noIframeSources, getChineseSourceName]);

  const visibleCards = useMemo(() => {
    return cards
      // 搜索时：只展示“有匹配数据”的卡片（避免一堆空卡片）
      .filter(x => (q ? x.status !== 'success' || (x.filtered?.length ?? 0) > 0 : true));
  }, [cards, q]);

  const groupTabs = useMemo(() => {
    const byGroup = new Map();

    for (const card of visibleCards) {
      const group = getGroupOfSource(card.src);
      if (!byGroup.has(group)) byGroup.set(group, []);
      byGroup.get(group).push(card);
    }

    // “全部”组：从配置读取 label
    const allGroup = GROUPS.find(g => g.key === 'all');
    if (allGroup && visibleCards.length) {
      byGroup.set(allGroup.label, visibleCards);
    }

    // 按预设顺序输出（不存在的组不显示）
    const tabs = [];
    for (const g of GROUP_ORDER) {
      const items = byGroup.get(g);
      if (!items || !items.length) continue;
      tabs.push({
        key: g,
        label: g,
        cards: items,
      });
    }

    // 防御：如果出现未知组名（理论上不会），追加到最后
    for (const [g, items] of byGroup.entries()) {
      if (GROUP_ORDER.includes(g)) continue;
      tabs.push({ key: g, label: g, cards: items });
    }

    return tabs;
  }, [visibleCards, GROUP_ORDER, getGroupOfSource]);

  const DEFAULT_GROUP_LABEL = useMemo(() => {
    const defKey = NEWS_UI?.tabs?.defaultGroupKey || 'all';
    const g = GROUPS.find(x => x.key === defKey);
    return g?.label || groupTabs[0]?.key || null;
  }, [groupTabs]);

  // 桌面端 tabs 当前激活分组
  const [activeGroup, setActiveGroup] = useState(DEFAULT_GROUP_LABEL);

  useEffect(() => {
    if (isMobile) return;
    if (!groupTabs.length) {
      if (activeGroup !== null) setActiveGroup(null);
      return;
    }

    const desired = DEFAULT_GROUP_LABEL || groupTabs[0]?.key;
    const exists = activeGroup && groupTabs.some(t => t.key === activeGroup);

    if (!exists) {
      setActiveGroup(desired || null);
      return;
    }

    // 若当前为空（首次渲染）也对齐默认
    if (!activeGroup && desired) {
      setActiveGroup(desired);
    }
  }, [isMobile, groupTabs, DEFAULT_GROUP_LABEL, activeGroup]);

  const desktopActiveTab = useMemo(() => {
    if (isMobile) return null;
    if (!groupTabs.length) return null;
    const key = activeGroup && groupTabs.some(t => t.key === activeGroup) ? activeGroup : groupTabs[0].key;
    return groupTabs.find(t => t.key === key) || groupTabs[0];
  }, [isMobile, groupTabs, activeGroup]);

  const fireAnim = (dir) => {
    setAnimDir(dir);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => setAnimDir(null), 220);
  };

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

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

  const swipeToPrev = () => {
    if (!isMobile) return;
    if (!activeCard) return;
    const idx = visibleCards.findIndex(x => x.src === activeCard.src);
    if (idx <= 0) return;
    fireAnim('right');
    setActiveSrc(visibleCards[idx - 1].src);
  };

  const swipeToNext = () => {
    if (!isMobile) return;
    if (!activeCard) return;
    const idx = visibleCards.findIndex(x => x.src === activeCard.src);
    if (idx < 0 || idx >= visibleCards.length - 1) return;
    fireAnim('left');
    setActiveSrc(visibleCards[idx + 1].src);
  };

  const onTouchStart = (e) => {
    if (!isMobile) return;
    if (pickerOpen) return;
    const t = e.touches?.[0];
    if (!t) return;

    swipeRef.current = {
      x0: t.clientX,
      y0: t.clientY,
      dx: 0,
      dy: 0,
      active: true,
    };
  };

  const onTouchMove = (e) => {
    if (!isMobile) return;
    if (!swipeRef.current.active) return;
    const t = e.touches?.[0];
    if (!t) return;

    swipeRef.current.dx = t.clientX - swipeRef.current.x0;
    swipeRef.current.dy = t.clientY - swipeRef.current.y0;
  };

  const onTouchEnd = () => {
    if (!isMobile) return;
    const st = swipeRef.current;
    if (!st.active) return;

    st.active = false;

    // 只在“明显水平滑动”时触发，避免与上下滚动冲突
    const absX = Math.abs(st.dx);
    const absY = Math.abs(st.dy);

    const MIN_X = 60;
    const RATIO = 1.5; // 水平位移至少是垂直的 1.5 倍

    if (absX < MIN_X) return;
    if (absX < absY * RATIO) return;

    // 左滑 -> 下一个；右滑 -> 上一个
    if (st.dx < 0) swipeToNext();
    else swipeToPrev();
  };

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

  // 手机端：来源选择器 + 单来源展示 + 左右滑动切换
  if (isMobile) {
    const activeIdx = activeCard ? visibleCards.findIndex(x => x.src === activeCard.src) : -1;
    const showLeftHint = activeIdx > 0;
    const showRightHint = activeIdx >= 0 && activeIdx < visibleCards.length - 1;

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

        <div
          className={`newsgrid-swipe-area${animDir ? ` newsgrid-swipe-anim dir-${animDir}` : ''}`}
          style={{ gridColumn: '1 / -1' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {showLeftHint ? <div className="newsgrid-edge-hint left" aria-hidden="true" /> : null}
          {showRightHint ? <div className="newsgrid-edge-hint right" aria-hidden="true" /> : null}

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
              highlightText={highlightTitle}
              retrySource={retrySource}
            />
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '24px 0' }}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无可用来源" />
            </div>
          )}
        </div>

        <Drawer
          title="选择来源"
          placement="bottom"
          open={pickerOpen}
          onClose={() => {
            setSourceFilter(''); // 清空搜索文本
            setPickerOpen(false);
          }}
          styles={{ 
            body: { 
              paddingTop: 12,
              background: 'var(--bg-secondary)'
            },
            header: {
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)'
            }
          }}
          className="source-picker-drawer"
        >
          <Input
            allowClear
            value={sourceFilter}
            placeholder="搜索来源..."
            onChange={e => setSourceFilter(e.target.value)}
            style={{ 
              marginBottom: 12,
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
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
                    fireAnim('left');
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

  // 桌面端：使用 Tabs 按分组切换（完全由配置驱动）
  const countMode = NEWS_UI?.tabs?.countMode || 'sourceCount';
  const showDot = NEWS_UI?.tabs?.showDot !== false;

  return (
    <div className="news-grid">
      <DesktopGroupTabs
        groupTabs={groupTabs}
        activeGroup={activeGroup}
        setActiveGroup={setActiveGroup}
        q={q}
        countMode={countMode}
        showDot={showDot}
      />

      <DesktopSourceCards
        cards={desktopActiveTab?.cards || []}
        q={q}
        readSet={readSet}
        linkBehavior={linkBehavior}
        openReaderFromItem={openReaderFromItem}
        markAsRead={markAsRead}
        isFavorited={isFavorited}
        toggleFavorite={toggleFavorite}
        copySnapshot={copySnapshot}
        generatePoster={generatePoster}
        isGeneratingPoster={isGeneratingPoster}
        getFullTimeString={getFullTimeString}
        formatTime={formatTime}
        highlightText={highlightTitle}
        retrySource={retrySource}
      />
    </div>
  );
}

export default NewsGrid;
