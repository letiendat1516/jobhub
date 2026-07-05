/**
 * asyncHandler
 * ------------------------------------------------------------------
 * Wraps an async Express route handler so that rejected promises are
 * forwarded to the centralized error-handling middleware instead of
 * crashing the process or silently hanging the request.
 *
 * Usage:
 *   router.post('/register', asyncHandler(AuthController.register));
 *
 * @param {Function} fn - Async Express handler (req, res, next).
 * @returns {Function} Express handler with try/catch forwarding.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
