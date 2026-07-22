import apiClient from './apiClient.js';

const applicationService = {
  getApplyContext: (jobId) => apiClient.get(`/applications/apply-context/${jobId}`),
  apply: (payload) => apiClient.post('/applications', payload),
  getMyApplications: (params = {}) => apiClient.get('/applications/me', { params }),
  getMyApplication: (id) => apiClient.get(`/applications/me/${id}`),
  getEmployerApplications: (params = {}, config = {}) =>
    apiClient.get('/applications/employer', { ...config, params }),
  reviewApplication: (id, config = {}) =>
    apiClient.get(`/applications/employer/${id}`, config),
  updateStatus: (id, payload) => apiClient.patch(`/applications/employer/${id}/status`, payload),
};

export default applicationService;
