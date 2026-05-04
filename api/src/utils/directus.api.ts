import axios, { AxiosError } from 'axios';
import configuration from '@/config/configuration';

const directusApi = axios.create({
  timeout: 10000,
});

directusApi.interceptors.request.use((config) => {
  const { directus } = configuration();

  config.baseURL = config.baseURL || directus.apiUrl;

  if (!config.headers.Authorization && directus.token) {
    config.headers.Authorization = `Bearer ${directus.token}`;
  }

  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
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
