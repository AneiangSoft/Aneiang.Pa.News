/**
 * 将时间转换为更友好的显示格式
 * @param {string|Date} timeStr - 时间字符串或 Date 对象
 * @returns {string} 格式化后的时间
 */
export function formatTime(timeStr) {
  if (!timeStr) return '--';

  const date = timeStr instanceof Date ? timeStr : new Date(timeStr);
  if (isNaN(date.getTime())) return String(timeStr);

  const now = new Date();
  const diff = (now - date) / 1000; // 秒数差

  // 1分钟内
  if (diff < 60) return '刚刚';

  // 1小时内
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins}分钟前`;
  }

  // 今天内
  if (date.toDateString() === now.toDateString()) {
    const hours = Math.floor(diff / 3600);
    return `${hours}小时前`;
  }

  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${formatTimePart(date)}`;
  }

  // 7天内
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}天前`;
  }

  // 今年内
  if (date.getFullYear() === now.getFullYear()) {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${formatTimePart(date)}`;
  }

  // 更早
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${formatTimePart(date)}`;
}

/**
 * 格式化时间部分 (HH:mm)
 * @private
 */
function formatTimePart(date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 获取完整的日期时间字符串
 * @param {string|Date} timeStr - 时间字符串或 Date 对象
 * @returns {string} 完整的时间字符串
 */
export function getFullTimeString(timeStr) {
  if (!timeStr) return '--';
  
  const date = timeStr instanceof Date ? timeStr : new Date(timeStr);
  if (isNaN(date.getTime())) return String(timeStr);
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}
