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

// Req 6 Feature 1: Update Application Status
export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { applicationId, status } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  application.status = status;
  application.notifications.push({
    message: `Your application status has been updated to "${status}".`,
  });

  await application.save();

  res.status(200).json({
    success: true,
    message: "Application status updated successfully!",
  });
});

// Feature 2: Schedule Interview
export const scheduleInterview = catchAsyncErrors(async (req, res, next) => {
  const { applicationId, interviewDate } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  application.interview.scheduled = true;
  application.interview.date = interviewDate;
  application.notifications.push({
    message: `Your interview has been scheduled for ${new Date(interviewDate).toLocaleString()}.`,
  });

  await application.save();

  res.status(200).json({
    success: true,
    message: "Interview scheduled successfully!",
  });
});

// Feature 3: Send Follow-Up
export const sendFollowUp = catchAsyncErrors(async (req, res, next) => {
  const { applicationId, message } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  application.notifications.push({
    message: `Follow-up: ${message}`,
  });

  await application.save();

  res.status(200).json({
    success: true,
    message: "Follow-up message sent successfully!",
  });
});

// Feature 4: Get Notifications
export const getNotifications = catchAsyncErrors(async (req, res, next) => {
  const { _id } = req.user;

  const applications = await Application.find({ "applicantID.user": _id });
  const notifications = applications.flatMap((app) => app.notifications);

  res.status(200).json({
    success: true,
    notifications,
  });
});
