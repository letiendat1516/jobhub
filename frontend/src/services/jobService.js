/**
 * jobService — Job search & posting API surface.
 * Scaffold only. Wired in Phase 7 (Job).
 */
import apiClient from './apiClient.js';

const getData = (response, fallback = null) => response?.data ?? fallback;

const jobService = {
  searchJobs: async (filters = {}) => {
    const response = await apiClient.get('/jobs', { params: filters });
    return getData(response, []);
  },

  getJobById: async (id) => {
    const response = await apiClient.get(`/jobs/${id}`);
    return getData(response, null);
  },

  getMyPostings: async () => {
    const response = await apiClient.get('/jobs/my-postings');
    return getData(response, []);
  },

  createJob: async (payload) => {
    const response = await apiClient.post('/jobs', payload);
    return getData(response, null);
  },

  updateJob: async (id, payload) => {
    const response = await apiClient.put(`/jobs/${id}`, payload);
    return getData(response, null);
  },

  closeJob: async (id) => {
    const response = await apiClient.patch(`/jobs/${id}/close`);
    return getData(response, null);
  },

  deleteJob: async (id) => {
    const response = await apiClient.delete(`/jobs/${id}`);
    return getData(response, null);
  },

  getPendingReviewJobs: async () => {
    const response = await apiClient.get('/jobs/admin/pending-review');
    return getData(response, []);
  },

  moderateJob: async (id, decision) => {
    const response = await apiClient.patch(`/jobs/${id}/moderate`, {
      decision,
    });

    return getData(response, null);
  },

  listCategories: async () => {
    const response = await apiClient.get('/jobs/categories');
    return getData(response, []);
  },

  createCategory: async (name) => {
    const response = await apiClient.post('/jobs/categories', { name });
    return getData(response, null);
  },

  updateCategory: async (id, name) => {
    const response = await apiClient.put(`/jobs/categories/${id}`, { name });
    return getData(response, null);
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/jobs/categories/${id}`);
    return getData(response, null);
  },

  listSkills: async () => {
    const response = await apiClient.get('/jobs/skills');
    return getData(response, []);
  },

  createSkill: async (name) => {
    const response = await apiClient.post('/jobs/skills', { name });
    return getData(response, null);
  },

  updateSkill: async (id, name) => {
    const response = await apiClient.put(`/jobs/skills/${id}`, { name });
    return getData(response, null);
  },

  deleteSkill: async (id) => {
    const response = await apiClient.delete(`/jobs/skills/${id}`);
    return getData(response, null);
  },
};

export default jobService;