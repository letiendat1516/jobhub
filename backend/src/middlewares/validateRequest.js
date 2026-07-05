/**
 * Request validation middleware
 * ------------------------------------------------------------------
 * Centralizes input validation using Zod schemas. Validation lives in
 * the validators/ layer (one schema per resource); controllers stay
 * thin and never repeat validation logic.
 *
 * Usage:
 *   router.post(
 *     '/register',
 *     validateRequest(authValidator.register),
 *     asyncHandler(AuthController.register),
 *   );
 *
 * @param {import('zod').ZodTypeAny} schema - Zod schema validating `req.body`.
 */
import ApiError from '../utils/ApiError.js';

const validateRequest = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // replace with the coerced/cleaned payload
    return next();
  } catch (error) {
    return next(ApiError.badRequest('Dữ liệu gửi lên không hợp lệ.', error.flatten()));
  }
};

export default validateRequest;
