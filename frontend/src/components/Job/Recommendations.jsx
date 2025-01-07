// src/pages/Recommendations.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Context } from '../../main';
import toast from 'react-hot-toast';

const Recommendations = () => {
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const { user } = useContext(Context); // Assuming user context has job seeker info

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // Fetch job seeker's profile
                const profileResponse = await axios.get(`http://localhost:4000/api/v1/user/profile`, { withCredentials: true });
                const profile = profileResponse.data;

                // Fetch all posted jobs
                const jobsResponse = await axios.get(`http://localhost:4000/api/v1/job/getalljobs`, { withCredentials: true });
                const jobs = jobsResponse.data.jobs;

                // Match logic
                const matches = jobs.filter(job => {
                    // Implement your matching logic here
                    // Example: Check if job category matches profile preferences
                    return job.category === profile.preferredCategory; // Adjust this logic as needed
                });

                setRecommendedJobs(matches);
            } catch (error) {
                toast.error(error.response.data.message);
            }
        };

        fetchRecommendations();
    }, [user]);

    return (
        <div className="recommendations">
            <h1>Job Recommendations</h1>
            {recommendedJobs.length > 0 ? (
                <div className="job-list">
                    {recommendedJobs.map(job => (
                        <div key={job._id} className="job-card">
                            <h3>{job.title}</h3>
                            <p>{job.description}</p>
                            <p>Location: {job.location}</p>
                            <p>Salary: {job.fixedSalary ? job.fixedSalary : `${job.salaryFrom} - ${job.salaryTo}`}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <h4>There are no jobs available based on your profile.</h4>
            )}
        </div>
    );
};

export default Recommendations;