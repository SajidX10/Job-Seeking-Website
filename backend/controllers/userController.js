import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";

// User Registration
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill in the complete form!", 400));
  }

  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email is already registered!", 409));
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });

  sendToken(user, 201, res, "User Registered Successfully!");
});

// User Login
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(
      new ErrorHandler("Please provide email, password, and role.", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  if (user.role !== role) {
    return next(
      new ErrorHandler(
        `User with the provided email does not match the role: ${role}.`,
        403
      )
    );
  }

  sendToken(user, 200, res, "User Logged In Successfully!");
});

// User Logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});

// Get User Details
export const getUser = catchAsyncErrors((req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated.", 401));
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// @desc    Get profile for job seeker
// @route   GET /api/v1/users/profile
// @access  Private (Job Seeker)
export const getProfile = catchAsyncErrors(async (req, res, next) => {
  // Fetch the current user using their ID from the authenticated request
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      expectedSalary: user.expectedSalary,
    },
  });
});

// @desc    Update profile for job seeker
// @route   PUT /api/v1/users/profile
// @access  Private (Job Seeker)
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, phone, location, expectedSalary } = req.body;

  const updatedData = {};

  // Only update fields if they are provided
  if (name) updatedData.name = name;
  if (phone) updatedData.phone = phone;
  if (location) updatedData.location = location;
  if (expectedSalary) updatedData.expectedSalary = expectedSalary;

  const user = await User.findByIdAndUpdate(req.user.id, updatedData, {
    new: true, // return updated document
    runValidators: true, // ensure validations are applied
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      expectedSalary: user.expectedSalary,
    },
  });
});