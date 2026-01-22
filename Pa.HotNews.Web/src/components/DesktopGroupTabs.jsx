import { startTransition, useMemo } from 'react';
import { Tabs } from 'antd';
import { GROUPS } from '../config/newsUiConfig';

function DesktopGroupTabs({
  groupTabs,
  activeGroup,
  setActiveGroup,
  q,
  countMode,
  showDot,
}) {
  const groupDotColorMap = useMemo(() => {
    const m = new Map();
    for (const g of GROUPS) {
      if (g?.label) m.set(g.label, g.dotColor);
    }
    return m;
  }, []);

  const tabItems = useMemo(() => {
    return (groupTabs || []).map(t => {
      const dotColor = groupDotColorMap.get(t.label);

      const count = (() => {
        if (countMode === 'hidden') return null;
        if (countMode === 'newsCount') {
          return (t.cards || []).reduce(
            (sum, c) => sum + (q ? (c.filtered?.length ?? 0) : (c.news?.length ?? 0)),
            0
          );
        }
        // sourceCount
        return (t.cards || []).length;
      })();

      return {
        key: t.key,
        label: (
          <>
            {showDot ? (
              <span
                className="newsgrid-tab-dot"
                style={dotColor ? { background: dotColor } : undefined}
                aria-hidden="true"
              />
            ) : null}
            {t.label}
            {count !== null ? <span className="newsgrid-tab-count">{count}</span> : null}
          </>
        ),
      };
    });
  }, [groupTabs, groupDotColorMap, countMode, q, showDot]);

  return (
    <div style={{ gridColumn: '1 / -1' }} className="newsgrid-group-tabs">
      <Tabs
        activeKey={activeGroup || (groupTabs?.[0]?.key ?? '')}
        items={tabItems}
        onChange={(k) => startTransition(() => setActiveGroup(k))}
      />
    </div>
  );
}

export default DesktopGroupTabs;
