import axios from 'axios';

// Create an axios instance with a base URL for our backend API
const apiClient = axios.create({
    baseURL: '/api/scraper/news', // Adjust the port if your backend runs on a different one
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Fetches the list of available news sources.
 * @returns {Promise<Array<string>>}
 */
export const getSources = async () => {
    try {
        const response = await apiClient.get('/sources');
        return response.data.sources;
    } catch (error) {
        console.error('Error fetching sources:', error);
        throw error;
    }
};

/**
 * Fetches news items for a specific source.
 * @param {string} source - The news source (e.g., 'BaiDu', 'ZhiHu').
 * @returns {Promise<object>}
 */
export const getNews = async (source, { bustCache = false } = {}) => {
    if (!source) {
        return Promise.resolve({ data: [] }); // Return empty data if source is not selected
    }
    try {
        const url = `/${source.toLowerCase()}`;
        const params = {};
        if (bustCache) {
            // 精确到分钟的版本号：YYYYMMDDHHmm
            const d = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            params.v = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
        }
        const response = await apiClient.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching news for ${source}:`, error);
        throw error;
    }
};

