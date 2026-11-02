export class AppError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function errorHandler(err, req, res, next) {
  // Check if error is an instance of our AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const firstIssue = err.issues?.[0];
    const message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Validation error';
    return res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message
      }
    });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(404).json({
      error: {
        code: 'CASE_NOT_FOUND',
        message: 'The requested case was not found'
      }
    });
  }

  // Fallback for unhandled internal errors
  console.error('[Unhandled Error]:', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred'
    }
  });
}

