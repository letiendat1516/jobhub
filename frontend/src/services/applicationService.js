import apiClient from './apiClient.js';

const applicationService = {
  getApplyContext: (jobId) => apiClient.get(`/applications/apply-context/${jobId}`),
  apply: (payload) => apiClient.post('/applications', payload),
  getMyApplications: (params = {}) => apiClient.get('/applications/me', { params }),
  getMyApplication: (id) => apiClient.get(`/applications/me/${id}`),
  getEmployerApplications: (params = {}) => apiClient.get('/applications/employer', { params }),
  reviewApplication: (id) => apiClient.get(`/applications/employer/${id}`),
  updateStatus: (id, payload) => apiClient.patch(`/applications/employer/${id}/status`, payload),
};

export default applicationService;
