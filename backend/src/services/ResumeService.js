import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';
import ResumeRepository from '../repositories/ResumeRepository.js';
import AiAnalysisRepository from '../repositories/AiAnalysisRepository.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { chatCompletion } from '../ai/deepseekClient.js';
import { buildResumeExtractionPrompt } from '../ai/promptBuilder.js';
import config from '../config/index.js';

const own = (resume, userId) => {
  if (!resume || Number(resume.job_seeker_id) !== Number(userId))
    throw ApiError.notFound('Không tìm thấy CV.');
  return resume;
};

/** Loại bỏ null byte (\u0000) — PostgreSQL cột text không chấp nhận ký tự này. */
const sanitizeText = (str) => (str || '').replace(/\u0000/g, '');

class ResumeService {
  static async uploadResume(userId, file, payload = {}) {
    if (!file) throw ApiError.badRequest('Vui lòng chọn tệp PDF.');
    const existing = await ResumeRepository.findResumesByUser(userId);
    const makePrimary = payload.isPrimary === 'true' || existing.length === 0;
    if (makePrimary) await ResumeRepository.clearPrimary(userId);

    let resume;
    try {
      resume = await ResumeRepository.saveResume({
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

    // UC-AI-01: phân tích CV bằng AI — chạy nền, không chặn response upload.
    // Lỗi AI không được làm hỏng luồng upload (upload vẫn coi là thành công).
    ResumeService.analyzeResume(userId, resume.resume_id).catch((error) => {
      logger.error({ err: error, resumeId: resume.resume_id }, 'Resume AI analysis failed');
    });

    return resume;
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

  /* ------------------------ UC-AI-01: Analyze Resume ----------------------- */

  /** Trích text thô từ file PDF trên đĩa (pdf-parse v2 API). */
  static async extractPdfText(filePath) {
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    let result;
    try {
      result = await parser.getText();
    } finally {
      await parser.destroy();
    }
    const text = sanitizeText(result.text).trim();
    if (!text) throw ApiError.badRequest('Không đọc được nội dung từ tệp CV.');
    return text;
  }

  /**
   * Phân tích CV bằng DeepSeek: trích skills, học vấn, kinh nghiệm, từ khoá.
   * Ghi kết quả vào bảng ai_analysis. Có thể gọi lại để re-analyze.
   */
  static async analyzeResume(userId, resumeId) {
    const resume = own(await ResumeRepository.findResumeById(resumeId), userId);
    const rawText = await ResumeService.extractPdfText(resume.file_path);

    let parsed;
    try {
      const { content } = await chatCompletion({
        task: 'resume_extraction',
        messages: buildResumeExtractionPrompt(rawText),
        metadata: { job_seeker_id: userId, resume_id: resumeId },
      });
      parsed = JSON.parse(content);
    } catch (error) {
      logger.error({ err: error, resumeId }, 'DeepSeek resume extraction failed');
      throw ApiError.internal('Không thể phân tích CV bằng AI. Vui lòng thử lại sau.');
    }

    return AiAnalysisRepository.saveAnalysis({
      resume_id: resumeId,
      summary: parsed.summary ? sanitizeText(parsed.summary) : null,
      extracted_skills: {
        skills: parsed.skills ?? [],
        soft_skills: parsed.soft_skills ?? [],
        languages: parsed.languages ?? [],
        certifications: parsed.certifications ?? [],
        work_experience: parsed.work_experience ?? [],
      },
      total_experience_years: parsed.total_experience_years ?? null,
      education_level: parsed.education_level ? sanitizeText(parsed.education_level) : null,
      raw_text: sanitizeText(rawText),
      model_version: config.deepseek.model,
    });
  }

  static async getAnalysis(userId, resumeId) {
    own(await ResumeRepository.findResumeById(resumeId), userId);
    const analysis = await AiAnalysisRepository.findLatestByResumeId(resumeId);
    if (!analysis) throw ApiError.notFound('CV chưa được phân tích.');
    return analysis;
  }
}

export default ResumeService;