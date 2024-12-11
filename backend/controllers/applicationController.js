import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js"; // Ensure this is the correct import path
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";
import { sendNotification } from "../utils/notification.js"; // Importing the notification utility

// Existing function to post an application
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
  
  const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath);

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

  // Send notification to the employer about the new application
  await sendNotification(jobDetails.postedBy, `New application received for ${jobDetails.title}`);

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

// Existing function for employers to get all applications
export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
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
});

// Existing function for job seekers to get their applications
export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
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
});

// Existing function for job seekers to delete their applications
export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
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
});

// New function to fetch all applications for a specific user
export const getApplicationsByUser = async (req, res) => {
   try {
     const userId = req.user.id; // Assume user information is available via authentication middleware
     const applications = await Application.find({ "applicantID.user": userId }).populate("employerID.user", "name email");
     
     res.status(200).json({
       success: true,
       applications,
     });
     
   } catch (error) {
     res.status(500).json({
       success: false,
       message: error.message,
     });
   }
};

// New function to allow employers to update the application status
export const updateApplicationStatus = async (req, res) => {
   try {
     const { id } = req.params; // Application ID from route params
     const { status } = req.body; // New status from request body

     // Validate status
     if (!["Pending", "Accepted", "Rejected", "Interview Scheduled"].includes(status)) {
       return res.status(400).json({
         success: false,
         message: "Invalid status provided!",
       });
     }

     const application = await Application.findById(id);

     if (!application) {
       return res.status(404).json({
         success: false,
         message: "Application not found!",
       });
     }

     application.status = status;
     await application.save();

     // Send notification about the status update
     await sendNotification(application.applicantID.user, `Your application status has been updated to ${status}`);

     res.status(200).json({
       success: true,
       message: "Application status updated successfully!",
       application,
     });
   } catch (error) {
     res.status(500).json({
       success: false,
       message: error.message,
     });
   }
};

// New function to get all applications for the logged-in user
export const getAllApplications = async (req, res) => {
   try {
     const userId = req.user.id; // Assuming req.user contains the logged-in user's details
     const applications = await Application.find({ applicantID: userId });

     res.status(200).json({
       success: true,
       applications,
     });
   } catch (error) {
     res.status(500).json({
       success: false,
       message: "Failed to fetch applications",
       error: error.message,
     });
   }
};

// New function to get applications by user ID
export const getApplicationsByUserId = async (req, res) => {
   try {
     const { userId } = req.params; // Get userId from request parameters
     const applications = await Application.find({ applicantID: userId }).populate("jobId", "title");

     res.status(200).json({ success: true, applications });
   } catch (error) {
     res.status(500).json({ success: false, message: error.message });
   }
};