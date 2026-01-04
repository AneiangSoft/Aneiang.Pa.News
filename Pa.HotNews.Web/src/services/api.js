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
export const getNews = async (source) => {
    if (!source) {
        return Promise.resolve({ data: [] }); // Return empty data if source is not selected
    }
    try {
        const response = await apiClient.get(`/${source.toLowerCase()}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching news for ${source}:`, error);
        throw error;
    }
};

