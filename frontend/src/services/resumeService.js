/**
 * resumeService — Resume upload & AI analysis API surface.
 * Scaffold only. Wired in Phase 6 (Resume) and Phase 9 (AI Analysis).
 */
import apiClient from './apiClient.js';

const resumeService = {
  /** POST /resumes (multipart/form-data) */
  upload: (_formData) => apiClient.post('/resumes', _formData),
  /** GET /resumes/me */
  getMyResume: () => apiClient.get('/resumes/me'),
  update: (id, payload) => apiClient.put(`/resumes/${id}`, payload),
  remove: (id) => apiClient.delete(`/resumes/${id}`),
  download: (id) => apiClient.get(`/resumes/${id}/download`, { responseType: 'blob' }),
};

export default resumeService;
