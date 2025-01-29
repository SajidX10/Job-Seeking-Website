import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Recommendations.css'; // Create this CSS file for styling

const Recommendations = () => {
    const [recommendedJobs, setRecommendedJobs] = useState([]); // Initialize as an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await axios.get('https://job-seeking-website-c1ds.onrender.com/api/v1/recommendations', { // Ensure the full URL is used
                    withCredentials: true, // Include credentials for CORS
                });

                console.log("API Response:", response.data); // Log the response

                // Check if the response data contains an array of jobs
                if (Array.isArray(response.data.jobs)) { // Adjusted to check for 'jobs'
                    setRecommendedJobs(response.data.jobs);
                } else {
                    throw new Error("Expected an array of jobs");
                }
            } catch (err) {
                setError(err.response ? err.response.data.message : err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (loading) return <div>Loading recommendations...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="recommendations-container">
            <h2>Recommended Jobs for You</h2>
            {recommendedJobs.length === 0 ? (
                <p>No job recommendations available at this time.</p>
            ) : (
                <ul className="job-list">
                    {recommendedJobs.map((job) => (
                        <li key={job._id} className="job-item">
                            <h3>{job.title}</h3>
                            <p>{job.description}</p>
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Salary:</strong> {job.salaryRange ? `$${job.salaryRange.min} - $${job.salaryRange.max}` : 'Not specified'}</p>
                            <a href={`/job/${job._id}`} className="apply-button">View Details</a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Recommendations;