import apiClient from './apiClient.js';

const adminService = {
  listJobSeekers: (params = {}) => apiClient.get('/admin/users/job-seekers', { params }),
  listUserEmployers: (params = {}) => apiClient.get('/admin/users/employers', { params }),
  updateJobSeekerStatus: (id, action) =>
    apiClient.patch(`/admin/users/job-seekers/${id}/status`, { action }),
  updateEmployerStatus: (id, action) =>
    apiClient.patch(`/admin/users/employers/${id}/status`, { action }),
  listEmployers: (params = {}) => apiClient.get('/admin/employers', { params }),
  updateEmployerVerification: (id, action) =>
    apiClient.patch(`/admin/employers/${id}/verification`, { action }),
};

export default adminService;
