import express from "express";
import {
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  postApplication,
  updateApplicationStatus,
  scheduleInterview,
  sendFollowUp,
  getNotifications,
  markNotificationsAsRead,
} from "../controllers/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Existing routes
router.post("/post", isAuthenticated, postApplication);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);

// Enhanced routes for Requirement 6
router.patch("/update-status", isAuthenticated, updateApplicationStatus);
router.post("/schedule-interview", isAuthenticated, scheduleInterview);
router.post("/send-followup", isAuthenticated, sendFollowUp);
router.get("/notifications", isAuthenticated, getNotifications);
router.patch("/notifications/mark-read", isAuthenticated, markNotificationsAsRead);

export default router;