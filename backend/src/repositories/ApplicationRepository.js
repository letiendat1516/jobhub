import getSupabaseClient from '../config/supabase.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const getClient = () => {
  const client = getSupabaseClient();
  if (!client) throw ApiError.internal('Chưa cấu hình database Supabase.');
  return client;
};

const fail = (error, context) => {
  logger.error({ err: error, context }, 'Application database query failed');
  throw ApiError.internal('Không thể xử lý hồ sơ ứng tuyển.');
};

const DETAIL_SELECT = `
  application_id, job_seeker_id, job_id, resume_id, cover_letter,
  status, application_date, updated_at,
  job:job_id (job_id, employer_id, job_title, location, city, job_type,
    status, is_approved, application_deadline,
    employer:employer_id (employer_id, company_name)),
  candidate:job_seeker_id (job_seeker_id, full_name, headline, city,
    profile_summary, is_active),
  resume:resume_id (resume_id, title, file_name, file_path, upload_date)
`;

class ApplicationRepository {
  static async getCandidateContext(jobSeekerId) {
    const client = getClient();
    const [profileResult, resumeResult] = await Promise.all([
      client
        .from('job_seeker')
        .select('job_seeker_id, full_name, headline, city, profile_summary, is_active')
        .eq('job_seeker_id', jobSeekerId)
        .maybeSingle(),
      client
        .from('resume')
        .select('resume_id, title, file_name, upload_date')
        .eq('job_seeker_id', jobSeekerId)
        .eq('is_primary', true)
        .order('upload_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (profileResult.error) fail(profileResult.error, 'getCandidateContext.profile');
    if (resumeResult.error) fail(resumeResult.error, 'getCandidateContext.resume');
    return { profile: profileResult.data, resume: resumeResult.data };
  }

  static async findJob(jobId) {
    const { data, error } = await getClient()
      .from('job')
      .select('job_id, employer_id, job_title, status, is_approved, application_deadline')
      .eq('job_id', jobId)
      .maybeSingle();
    if (error) fail(error, 'findJob');
    return data;
  }

  static async findDuplicate(jobSeekerId, jobId) {
    const { data, error } = await getClient()
      .from('application')
      .select('application_id')
      .eq('job_seeker_id', jobSeekerId)
      .eq('job_id', jobId)
      .maybeSingle();
    if (error) fail(error, 'findDuplicate');
    return data;
  }

  static async createApplication(payload) {
    const { data, error } = await getClient()
      .from('application')
      .insert(payload)
      .select('application_id, job_id, status, application_date')
      .single();
    if (error?.code === '23505') throw ApiError.conflict('Bạn đã ứng tuyển công việc này.');
    if (error) fail(error, 'createApplication');
    return data;
  }

  static async listForCandidate(jobSeekerId, filters) {
    const from = (filters.page - 1) * filters.limit;
    let query = getClient()
      .from('application')
      .select(
        `
      application_id, status, application_date, updated_at, cover_letter,
      job:job_id (job_id, job_title, location, city, job_type,
        employer:employer_id (employer_id, company_name)),
      resume:resume_id (resume_id, title, file_name)
    `,
        { count: 'exact' },
      )
      .eq('job_seeker_id', jobSeekerId)
      .order('application_date', { ascending: filters.sort !== 'oldest' })
      .range(from, from + filters.limit - 1);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.jobId) query = query.eq('job_id', filters.jobId);
    if (filters.submittedFrom) query = query.gte('application_date', filters.submittedFrom);
    if (filters.submittedTo)
      query = query.lte('application_date', `${filters.submittedTo}T23:59:59.999Z`);
    const { data, error, count } = await query;
    if (error) fail(error, 'listForCandidate');
    const keyword = filters.keyword?.toLowerCase();
    const items = keyword
      ? (data ?? []).filter((item) =>
          `${item.job?.job_title ?? ''} ${item.job?.employer?.company_name ?? ''}`
            .toLowerCase()
            .includes(keyword),
        )
      : (data ?? []);
    return {
      items,
      total: keyword ? items.length : (count ?? 0),
      page: filters.page,
      limit: filters.limit,
    };
  }

  static async listForEmployer(employerId, filters) {
    const from = (filters.page - 1) * filters.limit;
    let query = getClient()
      .from('application')
      .select(
        `
      application_id, status, application_date,
      candidate:job_seeker_id!inner (job_seeker_id, full_name, headline),
      job:job_id!inner (job_id, employer_id, job_title),
      resume:resume_id (resume_id, title, file_name)
    `,
        { count: 'exact' },
      )
      .order('application_date', { ascending: filters.sort !== 'oldest' })
      .range(from, from + filters.limit - 1);
    if (employerId) query = query.eq('job.employer_id', employerId);
    if (filters.jobId) query = query.eq('job_id', filters.jobId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.candidateName)
      query = query.ilike('candidate.full_name', `%${filters.candidateName}%`);
    if (filters.submittedFrom) query = query.gte('application_date', filters.submittedFrom);
    if (filters.submittedTo)
      query = query.lte('application_date', `${filters.submittedTo}T23:59:59.999Z`);
    const { data, error, count } = await query;
    if (error) fail(error, 'listForEmployer');
    return { items: data ?? [], total: count ?? 0, page: filters.page, limit: filters.limit };
  }

  static async findDetail(applicationId) {
    const client = getClient();
    const { data, error } = await client
      .from('application')
      .select(DETAIL_SELECT)
      .eq('application_id', applicationId)
      .maybeSingle();
    if (error) fail(error, 'findDetail');
    if (!data) return null;
    const { data: recommendations, error: recommendationError } = await client
      .from('job_recommendation')
      .select('match_score, recommendation_reason')
      .eq('job_seeker_id', data.job_seeker_id)
      .eq('job_id', data.job_id)
      .order('generated_at', { ascending: false })
      .limit(1);
    if (recommendationError) fail(recommendationError, 'findDetail.recommendation');
    return { ...data, job_recommendation: recommendations ?? [] };
  }

  static async listHistory(applicationId) {
    const { data, error } = await getClient()
      .from('application_status_history')
      .select('id, old_status, new_status, changed_by, changed_by_role, changed_at')
      .eq('application_id', applicationId)
      .order('changed_at', { ascending: true });
    if (error) fail(error, 'listHistory');
    return data ?? [];
  }

  static async updateStatusAtomic({
    applicationId,
    expectedStatus,
    newStatus,
    actorId,
    actorRole,
  }) {
    const { data, error } = await getClient()
      .rpc('update_application_status', {
        p_application_id: applicationId,
        p_expected_status: expectedStatus,
        p_new_status: newStatus,
        p_changed_by: actorId,
        p_changed_by_role: actorRole,
      })
      .single();
    if (error?.code === '40001')
      throw ApiError.conflict('Hồ sơ đã được cập nhật. Vui lòng tải lại.');
    if (error?.code === '22023') throw ApiError.badRequest('Chuyển trạng thái không hợp lệ.');
    if (error) fail(error, 'updateStatusAtomic');
    return data;
  }
}

export default ApplicationRepository;
