/**
 * Request validation middleware
 * ------------------------------------------------------------------
 * Centralizes input validation using Zod schemas.
 *
 * Validation rules are placed in the validators layer so controllers
 * only receive validated and normalized request data.
 *
 * Usage:
 * router.post(
 *   '/register',
 *   validateRequest(authValidator.register),
 *   asyncHandler(AuthController.register),
 * );
 *
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body'|'query'|'params'} source
 */
import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

const validateRequest =
  (schema, source = 'body') =>
  (req, _res, next) => {
    try {
      /*
       * Zod không chỉ kiểm tra mà còn có thể:
       * - trim chuỗi
       * - chuyển chuỗi thành số
       * - đặt giá trị mặc định
       */
      const parsedData = schema.parse(req[source]);

      /*
       * Controller sẽ nhận dữ liệu đã được kiểm tra
       * và chuẩn hóa, thay vì dữ liệu gốc từ client.
       */
      req[source] = parsedData;

      return next();
    } catch (error) {
      /*
       * Chỉ chuyển ZodError thành lỗi validation 400.
       * Những lỗi lập trình khác phải được chuyển tiếp
       * cho errorHandler xử lý như lỗi hệ thống.
       */
      if (!(error instanceof ZodError)) {
        return next(error);
      }

      const validationError = ApiError.badRequest(
        'Dữ liệu gửi lên không hợp lệ.',
        error.flatten(),
      );

      validationError.code = 'VALIDATION_ERROR';

      return next(validationError);
    }
  };

export default validateRequest;