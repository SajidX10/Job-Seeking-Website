import express from "express";
import { scheduleInterview, getInterviews } from "../controllers/interviewController.js";

const router = express.Router();

router.post("/", scheduleInterview);
router.get("/:candidateId", getInterviews);

export default router;
