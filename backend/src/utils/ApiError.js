/**
 * ApiError
 * ------------------------------------------------------------------
 * Standardized application error used across all layers.
 *
 * Centralized error handling (see middlewares/errorHandler.js) reads
 * `statusCode` and `message` and converts the error into a consistent
 * JSON response sent to the client.
 *
 * Internal details (stack traces, SQL, internal messages) must never
 * leak to the client. Only `message` is exposed.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code.
   * @param {string} message - Human-readable message safe to expose.
   * @param {object} [details] - Optional extra context for logging only.
   */
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isOperational = true;
    if (details) {
      this.details = details;
    }
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Yêu cầu không hợp lệ.', details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Không được phép truy cập.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Bạn không có quyền thực hiện thao tác này.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Không tìm thấy tài nguyên.') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Tài nguyên đã tồn tại.') {
    return new ApiError(409, message);
  }

  static notImplemented(message = 'Chức năng chưa được triển khai.') {
    return new ApiError(501, message);
  }

  static internal(message = 'Lỗi hệ thống. Vui lòng thử lại sau.') {
    return new ApiError(500, message);
  }

  static badGateway(message = 'Dịch vụ bên ngoài gặp lỗi.') {
    return new ApiError(502, message);
  }
}

export default ApiError;
