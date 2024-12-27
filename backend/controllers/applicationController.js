import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// Utility Function for Role Validation
const validateRole = (role, allowedRoles, next) => {
  if (!allowedRoles.includes(role)) {
    return next(
      new ErrorHandler(
        `${role} not allowed to access this resource.`,
        400
      )
    );
  }
};

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  validateRole(role, ["Job Seeker"], next);

  if (!req.files || !req.files.resume) {
    return next(new ErrorHandler("Resume file is required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(new ErrorHandler("Invalid file type. Allowed: PNG, JPEG, WEBP.", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath);
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown error");
    return next(new ErrorHandler("Failed to upload resume to Cloudinary.", 500));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  if (!name || !email || !coverLetter || !phone || !address || !jobId) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found for the provided ID.", 404));
  }

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID: { user: req.user._id, role: "Job Seeker" },
    employerID: { user: jobDetails.postedBy, role: "Employer" },
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Application submitted successfully!",
    application,
  });
});

export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  validateRole(req.user.role, ["Employer"], next);
  const applications = await Application.find({ "employerID.user": req.user._id });
  res.status(200).json({ success: true, applications });
});

export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  validateRole(req.user.role, ["Job Seeker"], next);
  const applications = await Application.find({ "applicantID.user": req.user._id });
  res.status(200).json({ success: true, applications });
});

export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
  validateRole(req.user.role, ["Job Seeker"], next);

  const application = await Application.findById(req.params.id);
  if (!application) {
    return next(new ErrorHandler("Application not found for the provided ID.", 404));
  }

  await application.deleteOne();
  res.status(200).json({ success: true, message: "Application deleted successfully." });
});
