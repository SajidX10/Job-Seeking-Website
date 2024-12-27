import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill in the complete form!", 400));
  }

  // Check if email is already registered
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email is already registered!", 409));
  }

  // Create the user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });

  // Send JWT token
  sendToken(user, 201, res, "User Registered Successfully!");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Check if all fields are provided
  if (!email || !password || !role) {
    return next(
      new ErrorHandler("Please provide email, password, and role.", 400)
    );
  }

  // Find user by email
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  // Check if password matches
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  // Check if role matches
  if (user.role !== role) {
    return next(
      new ErrorHandler(
        `User with the provided email does not match the role: ${role}.`,
        403
      )
    );
  }

  // Send JWT token
  sendToken(user, 200, res, "User Logged In Successfully!");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()), // Expire cookie immediately
      secure: process.env.NODE_ENV === "production", // Secure cookie in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // SameSite setting
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});

export const getUser = catchAsyncErrors((req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated.", 401));
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
});
