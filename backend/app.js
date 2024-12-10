import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import jobRouter from "./routes/jobRoutes.js";
import userRouter from "./routes/userRoutes.js";
import applicationRouter from "./routes/applicationRoutes.js";
import { config } from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path"; // Import path module
import { fileURLToPath } from "url"; // Import fileURLToPath to handle __dirname

const app = express();
config({ path: "./config/config.env" });

// Get the current directory equivalent of __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CORS configuration
app.use(
  cors({
    origin: [process.env.FRONTEND_URL], // Ensure this is correctly set in your .env file
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true, // Allows cookies to be sent with requests
  })
);

// Middleware
app.use(cookieParser()); // Parses cookies (used for JWT token)
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// File upload configuration
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"), // Now works correctly with ES modules
  })
);

// Define routes
app.use("/api/v1/user", userRouter); // User-related routes (register, login, etc.)
app.use("/api/v1/job", jobRouter); // Job-related routes
app.use("/api/v1/application", applicationRouter); // Application-related routes

// Connect to the database
dbConnection();

// Error handling middleware (should be last)
app.use(errorMiddleware);

export default app;
