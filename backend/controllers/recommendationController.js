import { User } from '../models/userSchema.js';
import { Job } from '../models/jobSchema.js';

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
            const locationMatch = job.location === user.location;
            const salaryMatch = user.expectedSalary ? 
                (job.fixedSalary <= user.expectedSalary || 
                (job.salaryFrom <= user.expectedSalary && job.salaryTo >= user.expectedSalary)) : true;
            return locationMatch && salaryMatch;
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