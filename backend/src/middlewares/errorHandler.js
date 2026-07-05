/**
 * Centralized error handler
 * ------------------------------------------------------------------
 * Mounted last in the Express pipeline. Converts every thrown error
 * into a consistent JSON response. Internal details (stack traces,
 * internal messages) are never exposed to the client.
 *
 * Contract:
 * {
 *   success: false,
 *   error: { message, code?, details? }
 * }
 */
import { ZodError } from 'zod';
import config from '../config/index.js';

const errorHandler = (err, req, res, _next) => {
  req.log?.error?.({ err }, 'Request failed');

  // Validation errors from Zod (see middlewares/validateRequest.js)
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Dữ liệu gửi lên không hợp lệ.',
        code: 'VALIDATION_ERROR',
        details: err.flatten(),
      },
    });
  }

  const statusCode = err.statusCode && Number.isInteger(err.statusCode)
    ? err.statusCode
    : 500;

  const isOperational = err.isOperational === true;

  return res.status(statusCode).json({
    success: false,
    error: {
      message: isOperational || statusCode < 500
        ? err.message
        : 'Lỗi hệ thống. Vui lòng thử lại sau.',
      ...(config.isProduction ? {} : { stack: err.stack }),
    },
  });
};

export default errorHandler;
