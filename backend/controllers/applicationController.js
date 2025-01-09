import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// Feature: Post Application
export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler("Invalid file type. Please upload a PNG file.", 400)
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
  }
  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };
  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !employerID ||
    !resume
  ) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }
  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

// Feature: Employer Get All Applications
export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

// Feature: Jobseeker Get All Applications
export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

// Feature: Jobseeker Delete Application
export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);

// Feature 1: Update Application Status with Enhanced Notification
export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { applicationId, status, note } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  // Check if user has permission
  if (req.user.role !== "Employer" || application.employerID.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to update this application", 403));
  }

  application.status = status;
  application.notifications.push({
    message: `Your application status has been updated to "${status}"${note ? `: ${note}` : ''}`,
    type: "Status Update",
  });

  if (note) {
    application.timeline.push({
      action: `Status updated to ${status}`,
      note: note,
    });
  }

  await application.save();

  res.status(200).json({
    success: true,
    message: "Application status updated successfully!",
  });
});

// Feature 2: Enhanced Interview Scheduling
export const scheduleInterview = catchAsyncErrors(async (req, res, next) => {
  const { applicationId, date, location, type, notes } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  // Check if user has permission
  if (req.user.role !== "Employer" || application.employerID.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to schedule interview", 403));
  }

  application.interview = {
    scheduled: true,
    date,
    location,
    type,
    notes,
  };

  application.status = "Interview Scheduled";
  
  application.notifications.push({
    message: `Interview scheduled for ${new Date(date).toLocaleString()}. Type: ${type}${location ? `. Location: ${location}` : ''}`,
    type: "Interview",
  });

  await application.save();

  res.status(200).json({
    success: true,
    message: "Interview scheduled successfully!",
  });
});

// Feature 3: Enhanced Follow-up System
export const sendFollowUp = catchAsyncErrors(async (req, res, next) => {
  const { applicationId, message } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  // Check if user has permission
  const isEmployer = req.user.role === "Employer" && application.employerID.user.toString() === req.user._id.toString();
  const isApplicant = req.user.role === "Job Seeker" && application.applicantID.user.toString() === req.user._id.toString();

  if (!isEmployer && !isApplicant) {
    return next(new ErrorHandler("Not authorized to send follow-up", 403));
  }

  application.followUps.push({
    message,
    sentBy: req.user._id,
  });

  application.notifications.push({
    message: `New follow-up message from ${req.user.role}: ${message}`,
    type: "Follow-up",
  });

  await application.save();

  res.status(200).json({
    success: true,
    message: "Follow-up message sent successfully!",
  });
});

// Feature 4: Enhanced Notification System
export const getNotifications = catchAsyncErrors(async (req, res, next) => {
  const { type, read, limit = 10, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.user.role === "Job Seeker") {
    query["applicantID.user"] = req.user._id;
  } else {
    query["employerID.user"] = req.user._id;
  }

  const applications = await Application.find(query)
    .select('notifications timeline followUps status interview')
    .sort({ 'notifications.timestamp': -1 });

  let notifications = applications.flatMap(app => app.notifications);

  // Apply filters
  if (type) {
    notifications = notifications.filter(n => n.type === type);
  }
  if (read !== undefined) {
    notifications = notifications.filter(n => n.read === (read === 'true'));
  }

  // Pagination
  const total = notifications.length;
  notifications = notifications.slice(skip, skip + parseInt(limit));

  res.status(200).json({
    success: true,
    notifications,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  });
});

// Mark notifications as read
export const markNotificationsAsRead = catchAsyncErrors(async (req, res, next) => {
  const { applicationId, notificationIds } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  // Check permission
  const isAuthorized = req.user.role === "Job Seeker" ? 
    application.applicantID.user.toString() === req.user._id.toString() :
    application.employerID.user.toString() === req.user._id.toString();

  if (!isAuthorized) {
    return next(new ErrorHandler("Not authorized", 403));
  }

  application.notifications.forEach(notification => {
    if (notificationIds.includes(notification._id.toString())) {
      notification.read = true;
    }
  });

  await application.save();

  res.status(200).json({
    success: true,
    message: "Notifications marked as read",
  });
});