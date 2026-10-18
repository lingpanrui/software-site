import axios from 'axios';
import { toast } from 'sonner';

import { getToken, clearToken } from './token';

const request = axios.create({
  baseURL: '/',
});

request.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        toast.error('登录已过期，请重新登录');
        setTimeout(() => {
          window.location.assign(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }, 800);
      }
    }
    return Promise.reject(error);
  },
);

const logger = {
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
  log: console.log.bind(console),
};

export * as authApi from './auth';
export * as softwareApi from './software';
export * as siteSettingsApi from './site-settings';

export { request, logger };
export { getToken, setToken, clearToken } from './token';
