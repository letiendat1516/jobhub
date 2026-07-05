/**
 * resumeService — Resume upload & AI analysis API surface.
 * Scaffold only. Wired in Phase 6 (Resume) and Phase 9 (AI Analysis).
 */
import apiClient from './apiClient.js';

const resumeService = {
  /** POST /resumes (multipart/form-data) */
  upload: (_formData) =>
    apiClient.post('/resumes', _formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  /** GET /resumes/me */
  getMyResume: () => apiClient.get('/resumes/me'),
};

export default resumeService;
