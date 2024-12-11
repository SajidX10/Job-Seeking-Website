import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  status: { type: String, default: "Scheduled" }, // Scheduled, Completed
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Interview", interviewSchema);
