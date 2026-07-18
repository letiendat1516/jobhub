/**
 * EmployerRepository
 * ------------------------------------------------------------------
 * Data access for employer/company accounts and public company data.
 * Only this layer issues SQL for these tables. Implemented in
 * Phase 5 (Employer).
 */
import getSupabaseClient from '../config/supabase.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const getClient = () => {
  const client = getSupabaseClient();

  if (!client) {
    throw ApiError.internal('Chưa cấu hình database Supabase.');
  }

  return client;
};

const handleError = (error, context) => {
  logger.error({ err: error, context }, 'Supabase query failed');
  throw ApiError.internal('Lỗi truy vấn database.');
};

const EMPLOYER_SELECT = `
  employer_id,
  company_name,
  email,
  phone,
  website,
  company_description,
  city,
  contact_name,
  gender,
  is_verified,
  created_at,
  updated_at,
  is_active
`;

class EmployerRepository {
  static async findEmployerById(id) {
    const { data, error } = await getClient()
      .from('employer')
      .select(EMPLOYER_SELECT)
      .eq('employer_id', id)
      .maybeSingle();

    if (error) {
      return handleError(error, 'EmployerRepository.findEmployerById');
    }

    return data;
  }

  static async updateEmployer(id, payload) {
    const { data, error } = await getClient()
      .from('employer')
      .update(payload)
      .eq('employer_id', id)
      .select(EMPLOYER_SELECT)
      .single();

    if (error) {
      return handleError(error, 'EmployerRepository.updateEmployer');
    }

    return data;
  }

  static async updateAccountStatus(id, isActive) {
    return EmployerRepository.updateEmployer(id, { is_active: isActive });
  }

  static async updateVerification(id, isVerified) {
    return EmployerRepository.updateEmployer(id, { is_verified: isVerified });
  }

  static async listEmployers(query = {}) {
    const { keyword, city, page = 1, limit = 20 } = query;

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let dbQuery = getClient()
      .from('employer')
      .select(EMPLOYER_SELECT, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (keyword) {
      dbQuery = dbQuery.or(
        `company_name.ilike.%${keyword}%,company_description.ilike.%${keyword}%`,
      );
    }

    if (city) {
      dbQuery = dbQuery.ilike('city', `%${city}%`);
    }

    const { data, error, count } = await dbQuery;

    if (error) {
      return handleError(error, 'EmployerRepository.listEmployers');
    }

    return {
      items: data ?? [],
      total: count ?? 0,
      page: Number(page),
      limit: Number(limit),
    };
  }
}

export default EmployerRepository;
