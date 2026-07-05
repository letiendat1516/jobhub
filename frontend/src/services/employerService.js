/**
 * employerService — Employer/company API surface.
 * Scaffold only. Wired in Phase 5 (Employer).
 */
import apiClient from './apiClient.js';

const employerService = {
  /** GET /employers */
  listEmployers: (_filters) => apiClient.get('/employers', { params: _filters }),
  /** GET /employers/:id */
  getEmployerById: (_id) => apiClient.get(`/employers/${_id}`),
};

export default employerService;
