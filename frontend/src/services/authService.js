/**
 * authService — Auth API surface for the Presentation layer.
 * ------------------------------------------------------------------
 * Scaffold only. Methods are wired to apiClient in Phase 3 (Authentication).
 */
import apiClient from './apiClient.js';

const authService = {
  /** POST /auth/register */
  register: (_payload) => apiClient.post('/auth/register', _payload),
  /** POST /auth/login */
  login: (_payload) => apiClient.post('/auth/login', _payload),
  /** POST /auth/logout */
  logout: () => apiClient.post('/auth/logout'),
  /** GET /auth/me */
  getMe: () => apiClient.get('/auth/me'),
};

export default authService;
