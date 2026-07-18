/** Read-only account queries for the admin management module. */
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

const cleanKeyword = (value = '') => value.trim().replace(/[,%()]/g, ' ');

const paginate = (page, limit) => {
  const normalizedPage = Number(page);
  const normalizedLimit = Number(limit);
  const from = (normalizedPage - 1) * normalizedLimit;
  return { page: normalizedPage, limit: normalizedLimit, from, to: from + normalizedLimit - 1 };
};

const accountStatusFilter = (query, status) => {
  if (status === 'active') return query.eq('is_active', true);
  if (status === 'blocked') return query.eq('is_active', false);
  return query;
};

class AdminRepository {
  static async listJobSeekers({ keyword = '', status = 'all', page = 1, limit = 20 }) {
    const paging = paginate(page, limit);
    let query = getClient()
      .from('job_seeker')
      .select(
        'job_seeker_id, full_name, email, phone, city, headline, is_active, is_verified, created_at, updated_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(paging.from, paging.to);

    query = accountStatusFilter(query, status);
    const safeKeyword = cleanKeyword(keyword);
    if (safeKeyword) {
      query = query.or(`full_name.ilike.%${safeKeyword}%,email.ilike.%${safeKeyword}%`);
    }

    const { data, error, count } = await query;
    if (error) return handleError(error, 'AdminRepository.listJobSeekers');
    return { items: data ?? [], total: count ?? 0, page: paging.page, limit: paging.limit };
  }

  static async listEmployers({
    keyword = '',
    status = 'all',
    verification = 'all',
    page = 1,
    limit = 20,
  }) {
    const paging = paginate(page, limit);
    let query = getClient()
      .from('employer')
      .select(
        'employer_id, company_name, contact_name, email, phone, city, website, is_active, is_verified, created_at, updated_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(paging.from, paging.to);

    query = accountStatusFilter(query, status);
    if (verification === 'verified') query = query.eq('is_verified', true);
    if (verification === 'pending') query = query.eq('is_verified', false);

    const safeKeyword = cleanKeyword(keyword);
    if (safeKeyword) {
      query = query.or(`company_name.ilike.%${safeKeyword}%,email.ilike.%${safeKeyword}%`);
    }

    const { data, error, count } = await query;
    if (error) return handleError(error, 'AdminRepository.listEmployers');
    return { items: data ?? [], total: count ?? 0, page: paging.page, limit: paging.limit };
  }
}

export default AdminRepository;
