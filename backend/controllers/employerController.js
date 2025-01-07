import { Job } from '../models/jobSchema.js';
import { User } from '../models/userSchema.js'; // Use named import

// =========================
// Function to match candidates for a specific job
export const matchCandidates = async (jobId) => {
    const job = await Job.findById(jobId);
    const users = await User.find({ role: 'jobSeeker' });

    const matchedCandidates = users.filter((user) => {
        const skillMatch = job.tags.some((tag) => user.preferences.skills.includes(tag));
        const locationMatch = job.location === user.preferences.location;
        return skillMatch && locationMatch;
    });

    return matchedCandidates;
};
// =========================