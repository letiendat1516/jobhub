/**
 * AiAnalysisRepository
 * ------------------------------------------------------------------
 * Data access cho bảng ai_analysis — lưu kết quả phân tích CV bằng
 * DeepSeek (UC-AI-01). Không có ràng buộc UNIQUE trên resume_id nên
 * mỗi lần phân tích lại sẽ tạo bản ghi mới; luôn lấy bản ghi mới nhất
 * theo analyzed_at khi truy vấn.
 */
import getSupabaseClient from '../config/supabase.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const getClient = () => {
  const client = getSupabaseClient();
  if (!client) throw ApiError.internal('Chưa cấu hình database Supabase.');
  return client;
};

const handleError = (error, context) => {
  logger.error({ err: error, context }, 'Supabase query failed');
  throw ApiError.internal('Lỗi truy vấn database.');
};

const SELECT = `
  analysis_id,
  resume_id,
  summary,
  extracted_skills,
  total_experience_years,
  education_level,
  model_version,
  analyzed_at
`;

class AiAnalysisRepository {
  static async saveAnalysis(payload) {
    const { data, error } = await getClient()
      .from('ai_analysis')
      .insert(payload)
      .select(SELECT)
      .single();
    if (error) return handleError(error, 'AiAnalysisRepository.saveAnalysis');
    return data;
  }

  static async findLatestByResumeId(resumeId) {
    const { data, error } = await getClient()
      .from('ai_analysis')
      .select(SELECT)
      .eq('resume_id', resumeId)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return handleError(error, 'AiAnalysisRepository.findLatestByResumeId');
    return data;
  }
}

export default AiAnalysisRepository;