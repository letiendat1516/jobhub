/**
 * ApiResponse
 * ------------------------------------------------------------------
 * Uniform envelope for every successful HTTP response.
 *
 * Shape:
 * {
 *   success: true,
 *   data: <payload>,
 *   meta:  <pagination / extra context>  // optional
 * }
 *
 * Controllers return an ApiResponse; the Express response is shaped
 * exclusively through this helper to keep the API contract consistent.
 */
class ApiResponse {
  /**
   * @param {object} res - Express response object.
   * @param {number} statusCode - HTTP status code.
   * @param {unknown} data - Response payload.
   * @param {object} [meta] - Optional metadata (pagination, etc.).
   */
  static success(res, statusCode = 200, data = null, meta = undefined) {
    const body = { success: true, data };
    if (meta) {
      body.meta = meta;
    }
    return res.status(statusCode).json(body);
  }

  static ok(res, data = null, meta = undefined) {
    return ApiResponse.success(res, 200, data, meta);
  }

  static created(res, data = null, meta = undefined) {
    return ApiResponse.success(res, 201, data, meta);
  }
}

export default ApiResponse;
