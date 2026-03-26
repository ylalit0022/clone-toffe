// server/middleware/errorHandler.js
// Centralized error handling (no stack traces in production)

function errorHandler(err, req, res, next) {
  console.error("[Error]", err);

  // Custom error object with code
  if (err.code) {
    return res.status(err.statusCode || 400).json({
      error: err.code,
      message: err.message,
    });
  }

  // Validation error
  if (err.details) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: err.details[0].message,
    });
  }

  // Default error (hide details in production)
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
}

module.exports = errorHandler;
