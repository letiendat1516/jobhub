/**
 * Authentication & authorization middleware
 * ------------------------------------------------------------------
 * - authenticate: verify JWT access token, gán `req.user` = decoded
 *   principal ({ sub, role, email, name, iat, exp }).
 * - authorize(...roles): RBAC — dùng sau authenticate để giới hạn role.
 *
 * Auth thủ công bằng JWT (docs/02 §3.5: Supabase Auth không dùng).
 * Token signing/verify owned bởi AuthService; middleware chỉ verify.
 */
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import AuthService from '../services/AuthService.js';

/** Lấy bearer token từ header Authorization. */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice('Bearer '.length).trim();
};

/**
 * Yêu cầu access token hợp lệ. Gắn decoded principal vào req.user.
 * 401 nếu thiếu / sai / hết hạn.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized('Vui lòng đăng nhập để tiếp tục.');
  }
  const decoded = await AuthService.verifyAccessToken(token);
  const principal = await AuthService.requireActivePrincipal(decoded);
  req.user = {
    ...decoded,
    ...principal,
    sub: principal.id,
    role: principal.role,
  };
  return next();
});

/**
 * Role-based access control. Phải dùng sau `authenticate`.
 * @param {...string} roles - role được phép, vd: 'job_seeker', 'employer', 'admin'
 */
const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    return next();
  };

export { authenticate, authorize };
export default { authenticate, authorize };
