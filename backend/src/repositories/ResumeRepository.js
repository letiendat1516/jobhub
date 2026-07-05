/**
 * ResumeRepository
 * ------------------------------------------------------------------
 * Data access for resumes and the AI-extracted structured profile
 * (skills, experience, education, certifications, languages, ...).
 * Only this layer issues SQL for these tables. Implemented in
 * Phase 6 (Resume) and Phase 9 (AI Resume Analysis).
 */
import ApiError from '../utils/ApiError.js';

class ResumeRepository {
  static async saveResume(_payload) {
    throw ApiError.notImplemented('ResumeRepository.saveResume');
  }

  static async findResumeById(_id) {
    throw ApiError.notImplemented('ResumeRepository.findResumeById');
  }

  static async findResumesByUser(_userId) {
    throw ApiError.notImplemented('ResumeRepository.findResumesByUser');
  }

  static async updateResume(_id, _payload) {
    throw ApiError.notImplemented('ResumeRepository.updateResume');
  }

  static async deleteResume(_id) {
    throw ApiError.notImplemented('ResumeRepository.deleteResume');
  }

  static async saveExtractedProfile(_resumeId, _profile) {
    throw ApiError.notImplemented('ResumeRepository.saveExtractedProfile');
  }
}

export default ResumeRepository;
