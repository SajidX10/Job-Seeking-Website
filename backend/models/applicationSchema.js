import mongoose from "mongoose";
import validator from "validator";

const applicationSchema = new mongoose.Schema(
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
      validate: [validator.isEmail, "Please provide a valid Email!"],
    },
    coverLetter: {
      type: String,
      required: [true, "Please provide a cover letter!"],
    },
    phone: {
      type: Number,
      required: [true, "Please enter your Phone Number!"],
    },
    address: {
      type: String,
      required: [true, "Please enter your Address!"],
    },
    resume: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    applicantID: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["Job Seeker"],
        required: true,
      },
    },
    employerID: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["Employer"],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Rejected", "Hired"],
      default: "Applied",
    },
    interview: {
      scheduled: { type: Boolean, default: false },
      date: { type: Date },
      location: { type: String },
      type: { 
        type: String, 
        enum: ["In-Person", "Virtual", "Phone"],
      },
      notes: { type: String },
    },
    notifications: [
      {
        message: { type: String, required: true },
        type: { 
          type: String, 
          enum: ["Status Update", "Interview", "Follow-up", "General"],
          required: true 
        },
        read: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    followUps: [{
      message: { type: String, required: true },
      sentBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
      },
      timestamp: { type: Date, default: Date.now },
    }],
    timeline: [{
      action: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String },
    }],
  },
  {
    timestamps: true,
  }
);

// Add timeline entry middleware
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      action: `Status changed to ${this.status}`,
      timestamp: new Date(),
    });
  }
  if (this.isModified('interview.scheduled') && this.interview.scheduled) {
    this.timeline.push({
      action: 'Interview scheduled',
      note: `Interview scheduled for ${this.interview.date}`,
      timestamp: new Date(),
    });
  }
  next();
});

export const Application = mongoose.model("Application", applicationSchema);