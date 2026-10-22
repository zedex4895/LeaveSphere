export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || (statusCode === 400 ? "VALIDATION_ERROR" : statusCode === 404 ? "NOT_FOUND" : statusCode === 409 ? "CONFLICT" : "INTERNAL_SERVER_ERROR");

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: err.message || "An unexpected error occurred.",
      details: err.details || []
    }
  });
}
