import express from "express";
import {
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  postApplication,
  updateApplicationStatus, // New function
  getAllApplications,       // New function for job seekers
  getApplicationsByUserId   // New function to get applications by user ID
} from "../controllers/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Job Seeker Routes
router.post("/post", isAuthenticated, postApplication); // Route to post an application
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications); // Get all applications for job seekers
router.get("/applications", isAuthenticated, getAllApplications); // Get all applications for the logged-in user
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication); // Delete an application

// Employer Routes
router.get("/employer/getall", isAuthenticated, employerGetAllApplications); // Get all applications for employers
router.patch("/applications/:id/status", isAuthenticated, updateApplicationStatus); // Update application status

// Route to get applications by user ID
router.get("/:userId", isAuthenticated, getApplicationsByUserId); // Get applications by user ID

export default router;