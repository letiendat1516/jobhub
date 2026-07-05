/**
 * 404 handler
 * ------------------------------------------------------------------
 * Catches requests that did not match any mounted route.
 */
import ApiError from '../utils/ApiError.js';

const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Không tìm thấy đường dẫn: ${req.originalUrl}`));
};

export default notFoundHandler;
