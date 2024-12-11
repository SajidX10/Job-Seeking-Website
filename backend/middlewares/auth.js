import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

// Middleware to check if the user is authenticated
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  let token;

  // Check if token is in cookies or authorization header
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(" ")[1];  // Extract token from "Bearer <token>"
  }

  // If token is not found
  if (!token) {
    return next(new ErrorHandler("User Not Authorized", 401));
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find user by decoded ID
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler("User Not Found", 404));
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return next(new ErrorHandler("Invalid or Expired Token", 401));
  }
});