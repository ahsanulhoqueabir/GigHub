import axios, { AxiosError } from 'axios';

const directusApi = axios.create({
  baseURL: process.env.DIRECTUS_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

directusApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      console.error('[Directus] Server not responding:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
      });
      return Promise.reject(new Error('Directus server not responding'));
    }

    const { status, data, config } = error.response;
    console.error('[Directus] Error response:', {
      status,
      url: config?.url,
      method: config?.method,
      data,
    });

    return Promise.reject(error);
  },
);

export default directusApi;
