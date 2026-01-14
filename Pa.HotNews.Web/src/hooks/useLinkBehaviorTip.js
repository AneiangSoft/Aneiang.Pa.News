import { useEffect, useRef } from 'react';
import { message } from 'antd';

// 切换到“站内阅读”时提示（仅切换触发，刷新不提示）
export function useLinkBehaviorTip({ linkBehavior, blockedSources, getChineseSourceName }) {
  const prevRef = useRef(linkBehavior);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = linkBehavior;

    if (prev !== 'in-app' && linkBehavior === 'in-app') {
      const blocked = Array.from(blockedSources)
        .map(s => getChineseSourceName(s))
        .join(' / ');

      message.info(
        `已切换为站内阅读。注意：${blocked} 平台可能无法站内打开，可按 Ctrl（macOS 为 ⌘）+ 鼠标点击标题快速跳转新标签页。`,
        4
      );
    }
  }, [linkBehavior, blockedSources, getChineseSourceName]);
}
