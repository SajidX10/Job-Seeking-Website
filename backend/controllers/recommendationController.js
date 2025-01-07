import { User } from '../models/userSchema.js'; // Use named import
import { Job } from '../models/jobSchema.js'; // Use named import

export const recommendJobs = async (userId, filterBy, sortBy) => {
    try {
        // Check if userId is valid
        if (!userId) {
            throw new Error("User ID is required");
        }

        // Fetch the user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Fetch all jobs
        const jobs = await Job.find({ expired: false });

        // Filter jobs based on user preferences
        let recommendedJobs = jobs.filter((job) => {
            const skillMatch = job.tags.some((tag) => user.preferences.skills.includes(tag));
            const locationMatch = job.location === user.preferences.location;
            return skillMatch && locationMatch;
        });

        // Apply additional filtering if provided
        if (filterBy) {
            recommendedJobs = recommendedJobs.filter(job => job.jobType === filterBy);
        }

        // Apply sorting if provided
        if (sortBy === 'salary') {
            recommendedJobs.sort((a, b) => (a.fixedSalary || a.salaryFrom) - (b.fixedSalary || b.salaryFrom));
        } else if (sortBy === 'date') {
            recommendedJobs.sort((a, b) => new Date(b.jobPostedOn) - new Date(a.jobPostedOn));
        }

        return recommendedJobs;
    } catch (error) {
        console.error("Error in recommendJobs:", error.message);
        throw new Error("Failed to fetch job recommendations");
    }
};

export const sendJobAlerts = async () => {
    try {
        const users = await User.find();
        for (const user of users) {
            const recommendedJobs = await recommendJobs(user._id);
            if (recommendedJobs.length > 0) {
                // Send notification (e.g., email, push notification)
                console.log(`Sending job alerts to ${user.email}`);
            }
        }
    } catch (error) {
        console.error("Error in sendJobAlerts:", error.message);
    }
};

// Run every hour (you can use a library like node-cron for this)
setInterval(sendJobAlerts, 3600000);