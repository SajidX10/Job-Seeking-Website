import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your Name!"],
      minLength: [3, "Name must contain at least 3 Characters!"],
      maxLength: [30, "Name cannot exceed 30 Characters!"],
    },
    email: {
      type: String,
      required: [true, "Please enter your Email!"],
      unique: true, // Ensure emails are unique
      validate: [validator.isEmail, "Please provide a valid Email!"],
    },
    phone: {
      type: String, // Changed to String to handle leading zeros
      required: [true, "Please enter your Phone Number!"],
    },
    password: {
      type: String,
      required: [true, "Please provide a Password!"],
      minLength: [8, "Password must contain at least 8 characters!"],
      maxLength: [32, "Password cannot exceed 32 characters!"],
      select: false, // Prevent password from being selected by default
    },
    role: {
      type: String,
      required: [true, "Please select a role!"],
      enum: ["Job Seeker", "Employer"], // Restrict to specific roles
    },
    location: {
      type: String, // New field for location
      default: '', // Optional field, default is an empty string
    },
    expectedSalary: {
      type: Number, // New field for expected salary
      default: null, // Optional field, default is null
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving or modifying
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with the hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJWTToken = function () {
  // Ensure process.env variables are valid
  if (!process.env.JWT_SECRET_KEY || !process.env.JWT_EXPIRE) {
    throw new Error("JWT_SECRET_KEY or JWT_EXPIRES is not set in the .env file");
  }

  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE, // Ensure this is a valid timespan (e.g., "7d")
    }
  );
};

// =========================
// Exporting the User model as a named export
export const User = mongoose.model("User", userSchema);
// =========================