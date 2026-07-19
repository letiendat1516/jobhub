/**
 * Centralized error handler
 * ------------------------------------------------------------------
 * Mounted last in the Express pipeline. Converts every thrown error
 * into a consistent JSON response.
 *
 * Internal details and stack traces are hidden in production.
 *
 * Contract:
 * {
 *   success: false,
 *   error: { message, code?, details? }
 * }
 */
import { ZodError } from 'zod';
import config from '../config/index.js';

const errorHandler = (err, req, res, next) => {
  /*
   * Nếu response đã được gửi một phần, chuyển lỗi cho Express
   * thay vì cố gắng gửi thêm response lần thứ hai.
   */
  if (res.headersSent) {
    return next(err);
  }

  req.log?.error?.({ err }, 'Request failed');

  /*
   * Trường hợp controller hoặc middleware ném trực tiếp ZodError.
   */
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Dữ liệu gửi lên không hợp lệ.',
        code: 'VALIDATION_ERROR',
        // Validation field errors are safe to surface in all environments.
        details: err.flatten(),
      },
    });
  }

  const statusCode =
    Number.isInteger(err.statusCode)
      ? err.statusCode
      : 500;

  const isOperational = err.isOperational === true;

  const message =
    isOperational || statusCode < 500
      ? err.message
      : 'Lỗi hệ thống. Vui lòng thử lại sau.';

  return res.status(statusCode).json({
    success: false,
    error: {
      message,

      /*
       * Trả mã lỗi và nguyên nhân chi tiết về frontend.
       */
      ...(err.code ? { code: err.code } : {}),

      // details may contain sensitive internal info (e.g. raw DB error fields
      // surfaced from ApiError.badRequest) — only expose in non-production.
      ...(!config.isProduction && err.details ? { details: err.details } : {}),

      /*
       * Chỉ trả stack trace trong môi trường phát triển.
       */
      ...(config.isProduction ? {} : { stack: err.stack }),
    },
  });
};

export default errorHandler;
