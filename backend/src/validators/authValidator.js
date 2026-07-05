/**
 * Auth input schemas (Zod)
 * ------------------------------------------------------------------
 * Centralized request validation for authentication endpoints.
 * Schemas describe the *shape* of valid input only — we don't encode
 * business rules (vd: email trùng) ở đây, chúng thuộc về AuthService.
 *
 * Register dùng discriminated union theo `role` để job_seeker và
 * employer có shape khác nhau (employer có nhiều trường chi tiết hơn).
 */
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
  .max(128, 'Mật khẩu không được vượt quá 128 ký tự.');

const emailSchema = z.string().trim().toLowerCase().email('Email không hợp lệ.').max(254);

/* -------------------- Register: job seeker -------------------- */
const registerJobSeeker = z.object({
  role: z.literal('job_seeker'),
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(2, 'Họ tên là bắt buộc.').max(100),
});

/* -------------------- Register: employer -------------------- */
const registerEmployer = z.object({
  role: z.literal('employer'),
  email: emailSchema,
  password: passwordSchema,
  // Người liên hệ (đại diện công ty)
  contactName: z.string().trim().min(2, 'Họ và tên là bắt buộc.').max(100),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Vui lòng chọn giới tính.' }),
  }),
  // Công ty
  companyName: z.string().trim().min(2, 'Tên công ty là bắt buộc.').max(255),
  phone: z.string().trim().min(8, 'Số điện thoại không hợp lệ.').max(20),
  city: z.string().trim().min(2, 'Vui lòng chọn tỉnh/thành phố.').max(100),
});

const register = z.discriminatedUnion('role', [registerJobSeeker, registerEmployer]);

const login = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

const changePassword = z.object({
  oldPassword: z.string().min(1),
  newPassword: passwordSchema,
});

const resetPassword = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export default {
  register,
  registerJobSeeker,
  registerEmployer,
  login,
  changePassword,
  resetPassword,
};
