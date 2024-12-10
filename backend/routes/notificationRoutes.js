import express from "express";
import { addNotification, getNotifications, markNotificationAsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", addNotification);
router.get("/:userId", getNotifications);
router.put("/:notificationId", markNotificationAsRead);

export default router;
