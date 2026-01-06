import axios from 'axios';

/**
 * 获取功能开关（Feature Flags）
 * 后端：GET /api/features
 * @returns {Promise<Record<string, boolean>>}
 */
export async function getFeatures() {
  try {
    const resp = await axios.get('/api/features', {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = resp?.data;
    if (data && typeof data === 'object') return data;
    return {};
  } catch {
    // 后端不可达/接口异常时，为安全起见返回空（即默认全部不可用）
    return {};
  }
}

