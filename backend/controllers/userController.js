import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import jwt from 'jsonwebtoken'; // Import jwt for token generation

// Register a new user
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  
  // Validate input
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  
  // Check if email already exists
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  
  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword, // Store hashed password
    role,
  });
  
  sendToken(user, 201, res, "User Registered!");
});

// Login a user
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  console.log("Request Body:", req.body); // Debug Request Body
  
  const user = await User.findOne({ email });
  
  console.log("User Found:", user); // Debug User Found

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid Email or Password."
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  
  console.log("Password Match:", isMatch); // Debug Password Match

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid Email or Password."
    });
  }

  // Generate JWT Token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h"
  });

  res.status(200).json({
    success: true,
    message: "User logged in successfully.",
    token
  });
});

// Logout a user
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});

// Get the logged-in user's details
export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  
  res.status(200).json({
    success: true,
    user,
  });
});