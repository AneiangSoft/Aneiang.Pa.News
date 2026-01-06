import axios from 'axios';

/**
 * 获取网站配置（页脚/导航栏/标题等使用）
 * @returns {Promise<{title?:string, titleSuffix?:string, icpLicense?:string}>}
 */
export const getSiteConfig = async () => {
  const res = await axios.get('/api/site-config', {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data || {};
};
