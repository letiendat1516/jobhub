/**
 * applicationService — Job application API surface.
 * Scaffold only. Wired in Phase 8 (Application).
 */
import apiClient from './apiClient.js';

const applicationService = {
  /** POST /applications */
  apply: (_payload) => apiClient.post('/applications', _payload),
  /** GET /applications/me */
  getMyApplications: () => apiClient.get('/applications/me'),
};

export default applicationService;
