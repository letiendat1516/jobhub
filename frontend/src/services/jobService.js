/**
 * jobService — Job search & posting API surface.
 * Scaffold only. Wired in Phase 7 (Job).
 */
import apiClient from './apiClient.js';

const jobService = {
  /** GET /jobs */
  searchJobs: (_filters) => apiClient.get('/jobs', { params: _filters }),
  /** GET /jobs/:id */
  getJobById: (_id) => apiClient.get(`/jobs/${_id}`),
  /** POST /jobs */
  createJob: (_payload) => apiClient.post('/jobs', _payload),
};

export default jobService;
