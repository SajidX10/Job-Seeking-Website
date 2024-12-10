import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: false },
  message: { type: String, required: true },
  status: { type: String, default: "unread" }, // "unread" or "read"
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
