/**
 * employerService — Employer/company API surface.
 * Scaffold only. Wired in Phase 5 (Employer).
 */
import apiClient from './apiClient.js';

const unwrap = (response) => response?.data ?? response;

const employerService = {
  listEmployers: async (filters = {}) => {
    const response = await apiClient.get('/employers', { params: filters });
    return unwrap(response);
  },

  getEmployerById: async (id) => {
    const response = await apiClient.get(`/employers/${id}`);
    return unwrap(response);
  },

  getMyProfile: async () => {
    const response = await apiClient.get('/employers/me');
    return unwrap(response);
  },

  updateMyProfile: async (payload) => {
    const response = await apiClient.put('/employers/me', payload);
    return unwrap(response);
  },

  getEmployerJobs: async (id) => {
    const response = await apiClient.get(`/employers/${id}/jobs`);
    return unwrap(response);
  },
};

export default employerService;