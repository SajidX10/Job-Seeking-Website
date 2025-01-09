import express from "express";
import { login, register, logout, getUser, getProfile, updateProfile } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// User registration route
router.post("/register", register);

// User login route
router.post("/login", login);

// User logout route
router.get("/logout", isAuthenticated, logout);

// Get user details route
router.get("/getuser", isAuthenticated, getUser);

// Route to get the current profile
router.get("/profile", isAuthenticated, getProfile);

// Route to update the profile
router.put("/profile", isAuthenticated, updateProfile);

export default router;