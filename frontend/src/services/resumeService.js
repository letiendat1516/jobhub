/**
 * resumeService — Resume upload & AI analysis API surface.
 */
import apiClient from './apiClient.js';

const resumeService = {
  /**
   * POST /resumes (multipart/form-data)
   *
   * IMPORTANT: Content-Type must be left undefined so the browser injects
   * the multipart boundary automatically.  If we leave the axios-instance
   * default of 'application/json' in place, Axios 1.x will call
   * JSON.stringify(formDataToJSON(formData)) and strip the file from the
   * request body — causing a 400 "Vui lòng chọn tệp PDF" from the server.
   */
  upload: (formData) =>
    apiClient.post('/resumes', formData, {
      headers: { 'Content-Type': undefined },
    }),

  /** GET /resumes/me */
  getMyResume: () => apiClient.get('/resumes/me'),
  update: (id, payload) => apiClient.put(`/resumes/${id}`, payload),
  remove: (id) => apiClient.delete(`/resumes/${id}`),
  download: (id) => apiClient.get(`/resumes/${id}/download`, { responseType: 'blob' }),

  /**
   * POST /resumes/:id/analyze
   * Trigger AI (DeepSeek) extraction for a specific CV.
   * This is a synchronous call that waits for the AI to finish (may take 30–90 s).
   */
  analyze: (id) =>
    apiClient.post(`/resumes/${id}/analyze`, {}, { timeout: 120_000 }),

  /**
   * GET /resumes/:id/analysis
   * Fetch the latest AI analysis result for a CV (404 if not yet analysed).
   */
  getAnalysis: (id) => apiClient.get(`/resumes/${id}/analysis`),
};

export default resumeService;
