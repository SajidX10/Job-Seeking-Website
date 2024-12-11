import express from "express";
import { login, register, logout, getUser } from "../controllers/userController.js"; // Importing functions from the controller
import { isAuthenticated } from "../middlewares/auth.js"; // Importing authentication middleware

const router = express.Router();

// User registration route
router.post("/register", register);

// User login route
router.post("/login", login); // This line maps the login route to the login function

// Logout route (requires authentication)
router.get("/logout", isAuthenticated, logout);

// Get user data route (requires authentication)
router.get("/getuser", isAuthenticated, getUser);

// Optional: Add a route to fetch user notifications (if needed)
// import { getUserNotifications } from "../controllers/userController.js";
// router.get("/notifications", isAuthenticated, getUserNotifications);

export default router;