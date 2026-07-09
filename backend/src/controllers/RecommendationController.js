/**
 * RecommendationController
 * ------------------------------------------------------------------
 * HTTP entry point for AI-powered job recommendations.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { chatCompletion } from '../ai/deepseekClient.js';
import { buildJobMatchingPrompt, buildResumeExtractionPrompt } from '../ai/promptBuilder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.resolve(__dirname, '../../../ai-lab/logs');

class RecommendationController {
  /** GET /api/recommendations — personalized jobs for the candidate */
  static async getRecommendations(_req, _res) {
    throw ApiError.notImplemented('RecommendationController.getRecommendations');
  }

  /** GET /api/recommendations/insights — matching reasoning for a job */
  static async getRecommendationInsights(_req, _res) {
    throw ApiError.notImplemented('RecommendationController.getRecommendationInsights');
  }

  /**
   * POST /api/recommendations/score-sql
   * Body: { cv: {skills[], experience_years, education_level}, jobs: [...] }
   * Chấm điểm bằng RULE-BASED (không gọi AI) — nhanh, miễn phí, deterministic.
   */
  static async scoreJobsSql(req, res) {
    const { cv, jobs } = req.body;
    if (!cv || !Array.isArray(jobs) || jobs.length === 0) {
      throw ApiError.badRequest('Thiếu cv hoặc jobs');
    }

    const cvSkillsLower = (cv.skills || []).map((s) => s.toLowerCase().trim());
    const cvSoftLower = (cv.soft_skills || []).map((s) => s.toLowerCase().trim());
    const cvExpYears = cv.experience_years ?? 0;
    const cvEdu = (cv.education_level || '').toLowerCase();
    const cvLangsLower = (cv.languages || []).map((l) => l.toLowerCase().trim());

    const EDU_RANK = { 'high school': 1, bachelor: 2, master: 3, phd: 4, other: 0 };

    const scores = jobs.map((job) => {
      const jobSkills = (job.skills || []).map((s) =>
        (typeof s === 'string' ? s : s.skill_name || s).toLowerCase().trim(),
      );
      // 1. Skills match (0-30)
      let skillsScore = 0;
      const missing = [];
      if (jobSkills.length > 0) {
        const matched = jobSkills.filter((sk) =>
          cvSkillsLower.some((cs) => cs.includes(sk) || sk.includes(cs)),
        );
        skillsScore = Math.round((matched.length / jobSkills.length) * 30);
        jobSkills.forEach((sk) => {
          if (!matched.includes(sk)) missing.push(sk);
        });
      } else {
        skillsScore = 15; // no skill requirement → neutral
      }

      // 2. Experience (0-20)
      let expScore = 0;
      const minExp = job.min_experience_years ?? 0;
      const expLevel = job.experience_level || '';
      if (cvExpYears >= minExp) {
        expScore = 18 + Math.min(2, cvExpYears - minExp);
      } else if (minExp > 0) {
        expScore = Math.round((cvExpYears / minExp) * 15);
      } else {
        expScore = 15; // no requirement → neutral
      }
      expScore = Math.min(20, expScore);

      // 3. Education (0-10)
      let eduScore = 5;
      const cvEduRank = EDU_RANK[cvEdu] ?? 0;
      if (cvEduRank >= 2) eduScore = 8; // Bachelor+
      if (cvEduRank >= 3) eduScore = 10; // Master+

      // 4. Domain match (0-15) — based on category overlap with work experience
      let domainScore = 5;
      const jobIndustry = (job.industry || '').toLowerCase();
      const cvExpText = JSON.stringify(cv.work_experience || cv.summary || '').toLowerCase();
      if (jobIndustry && cvExpText.includes(jobIndustry.slice(0, 8))) domainScore = 12;

      // 5. Soft skills (0-10) — check if CV has any soft skills mentioned
      let softScore = 5;
      if (cvSoftLower.length > 0) softScore = Math.min(10, 5 + cvSoftLower.length);

      // 6. Language (0-5)
      let langScore = 3;
      if (cvLangsLower.length > 0) langScore = Math.min(5, 2 + cvLangsLower.length);

      // 7. Career fit (0-10)
      let fitScore = 7;
      // overqualified penalty
      if (cvExpYears > minExp + 5) fitScore = 5;
      // big experience gap penalty
      if (minExp > 0 && cvExpYears < minExp - 2) fitScore = 4;

      const match_score =
        skillsScore + expScore + eduScore + domainScore + softScore + langScore + fitScore;
      const matched_skills = jobSkills.filter((sk) =>
        cvSkillsLower.some((cs) => cs.includes(sk) || sk.includes(cs)),
      );
      const strengths = [];
      if (skillsScore >= 20) strengths.push('Kỹ năng chuyên môn khớp cao');
      if (expScore >= 15) strengths.push('Kinh nghiệm đáp ứng yêu cầu');
      if (domainScore >= 10) strengths.push('Kinh nghiệm cùng ngành');
      if (softScore >= 8) strengths.push('Soft skills tốt');

      return {
        job_id: job.job_id,
        match_score: Math.min(100, match_score),
        score_breakdown: {
          skills: skillsScore,
          experience: expScore,
          education: eduScore,
          domain: domainScore,
          soft_skills: softScore,
          language: langScore,
          career_fit: fitScore,
        },
        recommendation_reason: `SQL: ${matched_skills.length}/${jobSkills.length || '?'} kỹ năng khớp, ${cvExpYears}/${minExp} năm KN. ${missing.length > 0 ? 'Thiếu: ' + missing.slice(0, 3).join(', ') + '.' : 'Đủ kỹ năng.'}`,
        missing_skills: missing.slice(0, 5),
        matched_skills,
        strengths,
        source: 'sql',
      };
    });

    return ApiResponse.ok(res, { scores, method: 'sql' });
  }

  /**
   * POST /api/recommendations/save
   * Body: { cvId, cvName, scores: {...}, jobs: [...] }
   * Lưu kết quả chấm điểm (AI + SQL) vào DB cho job seeker.
   */
  static async saveScores(req, res) {
    const { cvId, cvName, scores, jobs } = req.body;
    if (!scores || typeof scores !== 'object') {
      throw ApiError.badRequest('Thiếu scores');
    }
    // TODO: khi có auth job_seeker_id, insert vào bảng job_recommendation.
    // Hiện tại trả về OK để frontend biết đã nhận.
    const count = Object.keys(scores).length;
    return ApiResponse.ok(res, { saved: count, cvId, cvName });
  }

  /**
   * GET /api/recommendations/saved
   * Lấy kết quả chấm điểm đã lưu của job seeker.
   */
  static async getSavedScores(_req, res) {
    // TODO: query từ bảng job_recommendation khi có auth.
    return ApiResponse.ok(res, []);
  }

  /**
   * POST /api/recommendations/score
   * Body: { cv: {skills[], experience_years, education_level}, jobs: [...] }
   * Chấm điểm phù hợp CV với tối đa 100 jobs bằng DeepSeek.
   */
  static async scoreJobs(req, res) {
    const { cv, jobs } = req.body;
    if (!cv || !Array.isArray(jobs)) {
      throw ApiError.badRequest('Thiếu cv hoặc jobs trong body');
    }
    if (jobs.length === 0) {
      throw ApiError.badRequest('Danh sách jobs không được rỗng');
    }
    if (jobs.length > 100) {
      throw ApiError.badRequest(
        `Giới hạn 100 jobs/lần gọi (nhận ${jobs.length}). Hãy filter thêm.`,
      );
    }

    const messages = buildJobMatchingPrompt(cv, jobs);

    // Retry tối đa 2 lần nếu DeepSeek trả JSON sai format
    let scores;
    let tokensIn = 0;
    let tokensOut = 0;
    let lastError;
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await chatCompletion({
        task: 'job_matching',
        messages,
        metadata: { total_jobs_sent: jobs.length, attempt },
      });
      tokensIn = result.tokensIn;
      tokensOut = result.tokensOut;
      try {
        // DeepSeek có thể trả array hoặc object — handle cả 2
        const parsed = JSON.parse(result.content);
        scores = Array.isArray(parsed) ? parsed : parsed.scores || parsed;
        if (Array.isArray(scores) && scores.length > 0) break;
      } catch {
        lastError = 'DeepSeek trả về JSON không hợp lệ (lần ' + (attempt + 1) + ')';
      }
    }
    if (!scores || !Array.isArray(scores)) {
      throw ApiError.badGateway(lastError || 'DeepSeek trả về dữ liệu không hợp lệ');
    }

    return ApiResponse.ok(res, { scores, tokensIn, tokensOut });
  }

  /**
   * POST /api/recommendations/extract-cv
   * Body: { resumeText: '...' }
   * Trích xuất CV text thành structured JSON (skills, experience, education).
   */
  static async extractCv(req, res) {
    const { resumeText } = req.body;
    if (!resumeText || resumeText.trim().length < 20) {
      throw ApiError.badRequest('resumeText quá ngắn hoặc thiếu');
    }
    const messages = buildResumeExtractionPrompt(resumeText);
    const result = await chatCompletion({
      task: 'resume_extraction',
      messages,
      metadata: { text_length: resumeText.length },
    });

    let extracted;
    try {
      extracted = JSON.parse(result.content);
    } catch {
      throw ApiError.badGateway('DeepSeek trả về JSON không hợp lệ');
    }

    return ApiResponse.ok(res, {
      extracted,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
    });
  }

  /**
   * GET /api/recommendations/logs — danh sách AI logs (từ ai-lab/logs/*.json).
   * Hỗ trợ ?limit=20
   */
  static async getAiLogs(req, res) {
    const limit = Math.min(parseInt(req.query.limit ?? '50', 10), 200);
    let files;
    try {
      files = await fs.readdir(LOGS_DIR);
    } catch {
      return ApiResponse.ok(res, []);
    }
    const jsonFiles = files
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);

    const logs = [];
    for (const file of jsonFiles) {
      try {
        const raw = await fs.readFile(path.join(LOGS_DIR, file), 'utf8');
        logs.push(JSON.parse(raw));
      } catch {
        // skip corrupted file
      }
    }
    return ApiResponse.ok(res, logs);
  }
}

export default RecommendationController;
