import apiClient from './apiClient.js';

const jobSeekerService = {
  getProfile: () => apiClient.get('/job-seekers/me'),
  updateProfile: (payload) => apiClient.put('/job-seekers/me', payload),
};

export default jobSeekerService;
