class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  // Default error message and status
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  // Handling specific MongoDB errors
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = `JSON Web Token is invalid. Please log in again.`;
    err = new ErrorHandler(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = `Your session has expired. Please log in again.`;
    err = new ErrorHandler(message, 401);
  }

  // Send the error response
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorHandler;
