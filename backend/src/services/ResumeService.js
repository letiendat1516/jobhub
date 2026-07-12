import fs from 'node:fs/promises';
import path from 'node:path';
import ResumeRepository from '../repositories/ResumeRepository.js';
import ApiError from '../utils/ApiError.js';

const own = (resume, userId) => {
  if (!resume || Number(resume.job_seeker_id) !== Number(userId))
    throw ApiError.notFound('Không tìm thấy CV.');
  return resume;
};

class ResumeService {
  static async uploadResume(userId, file, payload = {}) {
    if (!file) throw ApiError.badRequest('Vui lòng chọn tệp PDF.');
    const existing = await ResumeRepository.findResumesByUser(userId);
    const makePrimary = payload.isPrimary === 'true' || existing.length === 0;
    if (makePrimary) await ResumeRepository.clearPrimary(userId);
    try {
      return await ResumeRepository.saveResume({
        job_seeker_id: userId,
        title: payload.title?.trim() || path.parse(file.originalname).name,
        file_name: file.originalname,
        file_path: file.path,
        is_primary: makePrimary,
      });
    } catch (error) {
      await fs.unlink(file.path).catch(() => undefined);
      throw error;
    }
  }
  static getResumes(userId) {
    return ResumeRepository.findResumesByUser(userId);
  }
  static async getResume(userId, id) {
    return own(await ResumeRepository.findResumeById(id), userId);
  }
  static async updateResume(userId, id, payload) {
    own(await ResumeRepository.findResumeById(id), userId);
    if (payload.isPrimary) await ResumeRepository.clearPrimary(userId, id);
    return ResumeRepository.updateResume(id, {
      ...(payload.label !== undefined ? { title: payload.label } : {}),
      ...(payload.isPrimary !== undefined ? { is_primary: payload.isPrimary } : {}),
    });
  }
  static async deleteResume(userId, id) {
    const resume = own(await ResumeRepository.findResumeById(id), userId);
    await ResumeRepository.deleteResume(id);
    await fs.unlink(resume.file_path).catch(() => undefined);
    const remaining = await ResumeRepository.findResumesByUser(userId);
    if (resume.is_primary && remaining[0])
      await ResumeRepository.updateResume(remaining[0].resume_id, { is_primary: true });
    return { deleted: true };
  }
}

export default ResumeService;
