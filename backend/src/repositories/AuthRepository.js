/**
 * AuthRepository
 * ------------------------------------------------------------------
 * Data access cho authentication. Đây là layer DUY NHẤT chạy SQL/call
 * Supabase (docs/02_ARCHITECTURE.md §3.4, docs/07_AI_AGENT_RULES.md §7).
 *
 * Lưu ý quan trọng về schema:
 *   Hệ thống có 3 bảng người dùng riêng biệt — KHÔNG có bảng `users` chung:
 *     - job_seeker  (cột full_name)
 *     - employer    (cột company_name)
 *     - admin       (cột full_name, tạo ngoài band)
 *   Service layer chịu trách nhiệm đảm bảo email là duy nhất toàn cục
 *   qua 3 bảng (gọi findAccountByEmail trước khi tạo).
 *
 * Repository này chỉ làm CRUD/query/mapping — không chứa business logic.
 */
import getSupabaseClient from '../config/supabase.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

const ROLE = Object.freeze({
  JOB_SEEKER: 'job_seeker',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
});

/** Trả về Supabase client hoặc throw nếu chưa cấu hình. */
const getClient = () => {
  const client = getSupabaseClient();
  if (!client) {
    throw ApiError.internal(
      'Database chưa được cấu hình (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY thiếu).',
    );
  }
  return client;
};

/** Log + ném lỗi chuẩn khi truy vấn Supabase thất bại. */
const handleError = (error, context) => {
  logger.error({ err: error, context }, 'Supabase query failed');
  throw ApiError.internal('Lỗi truy vấn cơ sở dữ liệu.');
};

/**
 * Map một dòng từ bảng bất kỳ về dạng account chuẩn dùng trong auth.
 * @param {object} row
 * @param {string} role
 */
const normalize = (row, role) => {
  if (!row) return null;
  const id = row.job_seeker_id ?? row.employer_id ?? row.admin_id;
  const name = row.full_name ?? row.company_name;
  return {
    id,
    role,
    email: row.email,
    name,
    password_hash: row.password_hash,
    created_at: row.created_at ?? null,
    is_active: row.is_active ?? true,
    is_verified: row.is_verified ?? false,
  };
};

class AuthRepository {
  /* ----------------------------- CREATE ----------------------------- */

  /** Tạo job seeker. @returns {{id, email, name, created_at}} */
  static async createJobSeeker({ full_name, email, password_hash }) {
    const { data, error } = await getClient()
      .from('job_seeker')
      .insert({ full_name, email, password_hash })
      .select('job_seeker_id, email, full_name, created_at')
      .single();
    if (error) {
      if (error.code === '23505') {
        throw ApiError.conflict('Email đã được sử dụng.');
      }
      return handleError(error, 'createJobSeeker');
    }
    return {
      id: data.job_seeker_id,
      email: data.email,
      name: data.full_name,
      created_at: data.created_at,
    };
  }

  /** Tạo employer. @returns {{id, email, name, created_at}} */
  static async createEmployer({
    company_name,
    email,
    password_hash,
    phone,
    city,
    contact_name,
    gender,
  }) {
    const { data, error } = await getClient()
      .from('employer')
      .insert({
        company_name,
        email,
        password_hash,
        phone,
        city,
        contact_name,
        gender,
      })
      .select('employer_id, email, company_name, created_at')
      .single();
    if (error) {
      if (error.code === '23505') {
        throw ApiError.conflict('Email đã được sử dụng.');
      }
      return handleError(error, 'createEmployer');
    }
    return {
      id: data.employer_id,
      email: data.email,
      name: data.company_name,
      created_at: data.created_at,
    };
  }

  /* ------------------------------ READ ------------------------------ */

  /** Tìm job seeker theo email (kèm password_hash để verify). */
  static async findJobSeekerByEmail(email) {
    const { data, error } = await getClient()
      .from('job_seeker')
      .select('job_seeker_id, email, full_name, password_hash, created_at, is_active, is_verified')
      .eq('email', email)
      .maybeSingle();
    if (error) return handleError(error, 'findJobSeekerByEmail');
    return normalize(data, ROLE.JOB_SEEKER);
  }

  /** Tìm employer theo email (kèm password_hash để verify). */
  static async findEmployerByEmail(email) {
    const { data, error } = await getClient()
      .from('employer')
      .select('employer_id, email, company_name, password_hash, created_at, is_active, is_verified')
      .eq('email', email)
      .maybeSingle();
    if (error) return handleError(error, 'findEmployerByEmail');
    return normalize(data, ROLE.EMPLOYER);
  }

  /** Tìm admin theo email (kèm password_hash để verify). */
  static async findAdminByEmail(email) {
    const { data, error } = await getClient()
      .from('admin')
      .select('admin_id, email, full_name, password_hash, created_at')
      .eq('email', email)
      .maybeSingle();
    if (error) return handleError(error, 'findAdminByEmail');
    if (!data) return null;
    return normalize({ ...data, is_active: true }, ROLE.ADMIN);
  }

  /**
   * Tìm account theo email qua CẢ 3 bảng (theo thứ tự ưu tiên
   * job_seeker → employer → admin). Trả về account chuẩn hoặc null.
   *
   * Email được service đảm bảo là duy nhất toàn cục khi đăng ký,
   * nên trong thực tế chỉ khớp tối đa 1 bảng.
   */
  static async findAccountByEmail(email) {
    const [seeker, employer, admin] = await Promise.all([
      AuthRepository.findJobSeekerByEmail(email),
      AuthRepository.findEmployerByEmail(email),
      AuthRepository.findAdminByEmail(email),
    ]);
    return seeker ?? employer ?? admin;
  }

  /* ---------------------- PUBLIC PROFILE (cho /me) ------------------ */

  /** Lấy profile công khai của job seeker (không chứa password_hash). */
  static async findJobSeekerPublicById(id) {
    const { data, error } = await getClient()
      .from('job_seeker')
      .select('job_seeker_id, email, full_name, headline, city, is_verified, is_active')
      .eq('job_seeker_id', id)
      .maybeSingle();
    if (error) return handleError(error, 'findJobSeekerPublicById');
    return data ? normalizePublic(data, ROLE.JOB_SEEKER) : null;
  }

  /** Lấy profile công khai của employer (không chứa password_hash). */
  static async findEmployerPublicById(id) {
    const { data, error } = await getClient()
      .from('employer')
      .select('employer_id, email, company_name, website, city, is_verified, is_active')
      .eq('employer_id', id)
      .maybeSingle();
    if (error) return handleError(error, 'findEmployerPublicById');
    return data ? normalizePublic(data, ROLE.EMPLOYER) : null;
  }

  /** Lấy principal admin thực tế; admin không có trạng thái is_active trong schema hiện tại. */
  static async findAdminPublicById(id) {
    const { data, error } = await getClient()
      .from('admin')
      .select('admin_id, email, full_name, created_at')
      .eq('admin_id', id)
      .maybeSingle();
    if (error) return handleError(error, 'findAdminPublicById');
    return data ? normalizePublic({ ...data, is_active: true }, ROLE.ADMIN) : null;
  }
}

/** Map dòng sang profile công khai (KHÔNG có password_hash). */
const normalizePublic = (row, role) => ({
  id: row.job_seeker_id ?? row.employer_id ?? row.admin_id,
  role,
  email: row.email,
  name: row.full_name ?? row.company_name,
  is_verified: row.is_verified ?? false,
  is_active: row.is_active ?? true,
  ...(row.created_at ? { created_at: row.created_at } : {}),
  // các trường phụ (headline/city/website...) đi kèm nếu có
  ...(row.headline ? { headline: row.headline } : {}),
  ...(row.city ? { city: row.city } : {}),
  ...(row.website ? { website: row.website } : {}),
});

export { ROLE as AUTH_ROLES };
export default AuthRepository;
