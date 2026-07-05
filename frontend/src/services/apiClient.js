/**
 * Axios API client
 * ------------------------------------------------------------------
 * Single configured Axios instance used by every service module.
 * This is the Presentation layer's only gateway to the backend
 * (docs/02_ARCHITECTURE.md §3.1) — components never call Axios directly.
 */
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/* ---- Request interceptor: attach access token (wired in Phase 3) ---- */
apiClient.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem('jobhub.accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ----- Response interceptor: normalize backend error envelope ------- */
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalized = {
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        'Đã có lỗi xảy ra. Vui lòng thử lại.',
      status: error?.response?.status || 0,
      details: error?.response?.data?.error?.details || null,
    };
    return Promise.reject(normalized);
  },
);

export default apiClient;
