import getSupabaseClient from '../config/supabase.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { repairLatin1DecodedUtf8 } from '../utils/utf8.js';

const client = () => {
  const value = getSupabaseClient();
  if (!value) throw ApiError.internal('Chưa cấu hình database Supabase.');
  return value;
};
const fail = (error, context) => {
  logger.error({ err: error, context }, 'Resume database query failed');
  throw ApiError.internal('Không thể xử lý CV.');
};
const SELECT = 'resume_id, job_seeker_id, title, file_name, file_path, is_primary, upload_date';
const normalizeResume = (resume) =>
  resume
    ? {
        ...resume,
        title: repairLatin1DecodedUtf8(resume.title),
        file_name: repairLatin1DecodedUtf8(resume.file_name),
      }
    : resume;

class ResumeRepository {
  static async saveResume(payload) {
    const { data, error } = await client().from('resume').insert(payload).select(SELECT).single();
    if (error) fail(error, 'saveResume');
    return normalizeResume(data);
  }
  static async findResumeById(id) {
    const { data, error } = await client()
      .from('resume')
      .select(SELECT)
      .eq('resume_id', id)
      .maybeSingle();
    if (error) fail(error, 'findResumeById');
    return normalizeResume(data);
  }
  static async findResumesByUser(userId) {
    const { data, error } = await client()
      .from('resume')
      .select(SELECT)
      .eq('job_seeker_id', userId)
      .order('is_primary', { ascending: false })
      .order('upload_date', { ascending: false });
    if (error) fail(error, 'findResumesByUser');
    return (data ?? []).map(normalizeResume);
  }
  static async clearPrimary(userId, exceptId = null) {
    let query = client().from('resume').update({ is_primary: false }).eq('job_seeker_id', userId);
    if (exceptId) query = query.neq('resume_id', exceptId);
    const { error } = await query;
    if (error) fail(error, 'clearPrimary');
  }
  static async updateResume(id, payload) {
    const { data, error } = await client()
      .from('resume')
      .update(payload)
      .eq('resume_id', id)
      .select(SELECT)
      .single();
    if (error) fail(error, 'updateResume');
    return normalizeResume(data);
  }
  static async deleteResume(id) {
    const { error } = await client().from('resume').delete().eq('resume_id', id);
    if (error) fail(error, 'deleteResume');
  }
}

export default ResumeRepository;
