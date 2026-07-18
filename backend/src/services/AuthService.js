/**
 * AuthService
 * ------------------------------------------------------------------
 * Toàn bộ business logic của authentication:
 *   - register / login
 *   - JWT access token issuance & verification
 *   - password hashing & verification (bcrypt)
 *
 * Service KHÔNG được chạy SQL hay gọi Supabase trực tiếp (docs/02 §3.3,
 * docs/07 §6). Mọi persistence delegate cho AuthRepository.
 *
 * Roles (docs/01 §3):
 *   - job_seeker  → bảng job_seeker
 *   - employer    → bảng employer
 *   - admin       → bảng admin (tạo ngoài band, không tự đăng ký)
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';
import AuthRepository, { AUTH_ROLES } from '../repositories/AuthRepository.js';

const SALT_ROUNDS = 10;

/**
 * Principal công khai trả về cho client (KHÔNG chứa password_hash).
 * @typedef {Object} Principal
 * @property {number} id
 * @property {'job_seeker'|'employer'|'admin'} role
 * @property {string} email
 * @property {string} name
 */

/** Ký access token. Payload chứa thông tin account + created_at.
 *  Khi rememberMe = true, TTL kéo dài 7 ngày (phiên duy trì qua reload/đóng tab).
 *  Mặc định 15 phút (hết hạn nhanh khi không chọn nhớ). */
const signAccessToken = (principal, rememberMe = false) =>
  jwt.sign(
    {
      sub: principal.id,
      role: principal.role,
      email: principal.email,
      name: principal.name,
      created_at: principal.created_at,
      remember: rememberMe,
    },
    config.jwt.secret,
    {
      expiresIn: rememberMe
        ? config.jwt.refreshTokenTtl // 7d khi nhớ đăng nhập
        : config.jwt.accessTokenTtl, // 15m mặc định
    },
  );

class AuthService {
  /**
   * Đăng ký tài khoản mới (job_seeker hoặc employer).
   * Admin KHÔNG đăng ký qua endpoint này.
   *
   * Shape payload tuỳ role (discriminated union trong authValidator):
   *   - job_seeker: { email, password, fullName }
   *   - employer:   { email, password, contactName, gender, companyName, phone, city }
   *
   * @param {object} payload
   * @returns {Promise<{user: Principal, accessToken: string}>}
   */
  static async register({ email, password, role, ...rest }) {
    // Email phải là duy nhất toàn cục qua 3 bảng.
    const existing = await AuthRepository.findAccountByEmail(email);
    if (existing) {
      throw ApiError.conflict('Email đã được sử dụng.');
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { fullName, companyName, contactName, gender, phone, city } = rest;

    let record;
    if (role === AUTH_ROLES.JOB_SEEKER) {
      record = await AuthRepository.createJobSeeker({
        full_name: fullName,
        email,
        password_hash,
      });
    } else if (role === AUTH_ROLES.EMPLOYER) {
      record = await AuthRepository.createEmployer({
        company_name: companyName,
        email,
        password_hash,
        phone,
        city,
        contact_name: contactName,
        gender,
      });
    } else {
      throw ApiError.badRequest('Role không hợp lệ.');
    }

    const principal = {
      id: record.id,
      role,
      email: record.email,
      name: record.name,
      created_at: record.created_at,
    };

    return { user: principal, accessToken: signAccessToken(principal, rest.rememberMe) };
  }

  /**
   * Đăng nhập bằng email + password. Tự xác định role từ bảng chứa email.
   * @param {{email:string, password:string, rememberMe?:boolean}} credentials
   * @returns {Promise<{user: Principal, accessToken: string}>}
   */
  static async login({ email, password, rememberMe = false }) {
    const account = await AuthRepository.findAccountByEmail(email);
    if (!account) {
      // Thông báo chung để không tiết lộ email nào tồn tại.
      throw ApiError.unauthorized('Email hoặc mật khẩu không đúng.');
    }
    if (account.is_active === false) {
      throw ApiError.forbidden('Tài khoản đã bị vô hiệu hóa.');
    }

    const ok = await bcrypt.compare(password, account.password_hash);
    if (!ok) {
      throw ApiError.unauthorized('Email hoặc mật khẩu không đúng.');
    }

    const principal = {
      id: account.id,
      role: account.role,
      email: account.email,
      name: account.name,
      created_at: account.created_at,
    };

    return { user: principal, accessToken: signAccessToken(principal, rememberMe) };
  }

  /**
   * Verify access token (dùng cho middleware authenticate).
   * @param {string} token
   * @returns {Promise<Principal & {iat:number, exp:number}>}
   */
  static async verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch {
      throw ApiError.unauthorized('Phiên đăng nhập đã hết hạn hoặc không hợp lệ.');
    }
  }

  /**
   * Lấy principal công khai theo role + id (cho endpoint GET /me).
   * @param {string} role
   * @param {number} id
   * @returns {Promise<Principal|null>}
   */
  static async getPrincipal(role, id) {
    if (role === AUTH_ROLES.JOB_SEEKER) {
      return AuthRepository.findJobSeekerPublicById(id);
    }
    if (role === AUTH_ROLES.EMPLOYER) {
      return AuthRepository.findEmployerPublicById(id);
    }
    if (role === AUTH_ROLES.ADMIN) {
      return AuthRepository.findAdminPublicById(id);
    }
    return null;
  }

  /**
   * Resolve the signed-token subject against the live database state.
   * This prevents a blocked/deleted account from continuing to use an old JWT.
   */
  static async requireActivePrincipal(decoded) {
    const principal = await AuthService.getPrincipal(decoded.role, decoded.sub);
    if (!principal) {
      throw ApiError.unauthorized('Tài khoản không còn tồn tại.');
    }
    if (principal.is_active === false) {
      throw ApiError.forbidden('Tài khoản đã bị vô hiệu hóa.');
    }
    return principal;
  }
}

export default AuthService;
