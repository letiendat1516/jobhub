/**
 * AuthController
 * ------------------------------------------------------------------
 * HTTP entry point cho authentication endpoints.
 *
 * Responsibilities (docs/02 §3.2):
 *   - Receive HTTP request
 *   - Validate request (qua validateRequest middleware + Zod)
 *   - Call AuthService
 *   - Return HTTP response (qua ApiResponse)
 *
 * KHÔNG chứa business logic / SQL / gọi AI.
 */
import ApiResponse from '../utils/ApiResponse.js';
import AuthService from '../services/AuthService.js';

class AuthController {
  /** POST /api/auth/register → { user, accessToken } */
  static async register(req, res) {
    const result = await AuthService.register(req.body);
    return ApiResponse.created(res, result);
  }

  /** POST /api/auth/login → { user, accessToken } */
  static async login(req, res) {
    const result = await AuthService.login(req.body);
    return ApiResponse.ok(res, result);
  }

  /** GET /api/auth/me → principal công khai (yêu cầu authenticate) */
  static async getMe(req, res) {
    const { role, sub } = req.user;
    const user = await AuthService.getPrincipal(role, sub);
    return ApiResponse.ok(res, user);
  }

  // Các endpoint dưới đây vẫn ở trạng thái scaffold — chưa thuộc phạm vi
  // Phase 3 (register/login/role). Giữ nguyên throw notImplemented.
  // static async logout / refreshToken / forgotPassword / resetPassword / changePassword
}

export default AuthController;
