/**
 * JobSeekerRepository
 * ------------------------------------------------------------------
 * Data access for job-seeker profiles: basic info (job_seeker),
 * education, work experience, and skills (job_seeker_skill + skill).
 * Only this layer issues SQL for these tables.
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

const PROFILE_SELECT = `
  job_seeker_id,
  full_name,
  email,
  phone,
  address,
  city,
  headline,
  profile_summary,
  is_verified,
  is_open_to_work,
  is_active,
  created_at,
  updated_at
`;

const EDUCATION_SELECT =
  'education_id, job_seeker_id, school_name, degree, major, start_year, end_year';

const EXPERIENCE_SELECT =
  'experience_id, job_seeker_id, company_name, position, start_date, end_date, description';

const SKILL_SELECT = `
  job_seeker_id,
  skill_id,
  experience_years,
  skill_detail,
  source,
  skill:skill_id ( skill_id, skill_name )
`;

class JobSeekerRepository {
  static async findJobSeekerById(id) {
    const { data, error } = await getClient()
      .from('job_seeker')
      .select(PROFILE_SELECT)
      .eq('job_seeker_id', id)
      .maybeSingle();
    if (error) return handleError(error, 'JobSeekerRepository.findJobSeekerById');
    return data;
  }

  static async updateJobSeeker(id, payload) {
    const { data, error } = await getClient()
      .from('job_seeker')
      .update(payload)
      .eq('job_seeker_id', id)
      .select(PROFILE_SELECT)
      .single();
    if (error) return handleError(error, 'JobSeekerRepository.updateJobSeeker');
    return data;
  }

  static async updateAccountStatus(id, isActive) {
    return JobSeekerRepository.updateJobSeeker(id, { is_active: isActive });
  }

  static async listEducation(jobSeekerId) {
    const { data, error } = await getClient()
      .from('education')
      .select(EDUCATION_SELECT)
      .eq('job_seeker_id', jobSeekerId)
      .order('start_year', { ascending: false });
    if (error) return handleError(error, 'JobSeekerRepository.listEducation');
    return data ?? [];
  }

  static async replaceEducation(jobSeekerId, rows = []) {
    const client = getClient();
    const { error: deleteError } = await client
      .from('education')
      .delete()
      .eq('job_seeker_id', jobSeekerId);
    if (deleteError)
      return handleError(deleteError, 'JobSeekerRepository.replaceEducation.delete');
    if (rows.length === 0) return [];
    const payload = rows.map((row) => ({ ...row, job_seeker_id: jobSeekerId }));
    const { data, error } = await client.from('education').insert(payload).select(EDUCATION_SELECT);
    if (error) return handleError(error, 'JobSeekerRepository.replaceEducation.insert');
    return data ?? [];
  }

  static async listWorkExperience(jobSeekerId) {
    const { data, error } = await getClient()
      .from('work_experience')
      .select(EXPERIENCE_SELECT)
      .eq('job_seeker_id', jobSeekerId)
      .order('start_date', { ascending: false });
    if (error) return handleError(error, 'JobSeekerRepository.listWorkExperience');
    return data ?? [];
  }

  static async replaceWorkExperience(jobSeekerId, rows = []) {
    const client = getClient();
    const { error: deleteError } = await client
      .from('work_experience')
      .delete()
      .eq('job_seeker_id', jobSeekerId);
    if (deleteError)
      return handleError(deleteError, 'JobSeekerRepository.replaceWorkExperience.delete');
    if (rows.length === 0) return [];
    const payload = rows.map((row) => ({ ...row, job_seeker_id: jobSeekerId }));
    const { data, error } = await client
      .from('work_experience')
      .insert(payload)
      .select(EXPERIENCE_SELECT);
    if (error) return handleError(error, 'JobSeekerRepository.replaceWorkExperience.insert');
    return data ?? [];
  }

  static async listSkills(jobSeekerId) {
    const { data, error } = await getClient()
      .from('job_seeker_skill')
      .select(SKILL_SELECT)
      .eq('job_seeker_id', jobSeekerId);
    if (error) return handleError(error, 'JobSeekerRepository.listSkills');
    return data ?? [];
  }

  static async replaceSkills(jobSeekerId, rows = []) {
    const client = getClient();
    const { error: deleteError } = await client
      .from('job_seeker_skill')
      .delete()
      .eq('job_seeker_id', jobSeekerId);
    if (deleteError) return handleError(deleteError, 'JobSeekerRepository.replaceSkills.delete');
    if (rows.length === 0) return [];
    const payload = rows.map((row) => ({ ...row, job_seeker_id: jobSeekerId }));
    const { data, error } = await client
      .from('job_seeker_skill')
      .insert(payload)
      .select(SKILL_SELECT);
    if (error) return handleError(error, 'JobSeekerRepository.replaceSkills.insert');
    return data ?? [];
  }
}

export default JobSeekerRepository;
