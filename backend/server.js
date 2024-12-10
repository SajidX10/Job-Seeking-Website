import express from "express"; // Ensure express is imported
import app from "./app.js";
import cloudinary from "cloudinary";
import applicationRoutes from "./routes/applicationRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // Import userRoutes
import notificationRoutes from "./routes/notificationRoutes.js"; // Import notification routes
import interviewRoutes from "./routes/interviewRoutes.js"; // Import interview routes

// Middleware for parsing JSON
app.use(express.json()); // Add this middleware for handling JSON requests

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome!'); // Response for the root URL
});

// Use the application, user, notification, and interview routes
app.use("/api/v1/applications", applicationRoutes); // Existing route for applications
app.use("/api/v1/users", userRoutes);              // Route for user-related actions
app.use("/api/v1/notifications", notificationRoutes); // Route for notifications
app.use("/api/v1/interviews", interviewRoutes);       // Route for interviews

// Start the server
const PORT = process.env.PORT || 4000; // Default to port 4000 if not specified
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
