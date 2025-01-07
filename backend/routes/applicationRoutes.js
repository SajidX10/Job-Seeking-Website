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
} from "../controllers/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isAuthenticated, postApplication);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);

// New routes for 6th Requirement
router.patch("/update-status", isAuthenticated, updateApplicationStatus);
router.post("/schedule-interview", isAuthenticated, scheduleInterview);
router.post("/send-followup", isAuthenticated, sendFollowUp);
router.get("/notifications", isAuthenticated, getNotifications);

export default router;
