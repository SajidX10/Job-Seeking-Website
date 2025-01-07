import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CandidateMatches = ({ jobId }) => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get(`/api/v1/job/jobs/${jobId}/matches`, {
                    withCredentials: true,
                });
                setCandidates(response.data);
            } catch (err) {
                setError(err.response ? err.response.data.message : err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [jobId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Matched Candidates</h2>
            <ul>
                {candidates.map((candidate) => (
                    <li key={candidate._id}>
                        <h3>{candidate.name}</h3>
                        <p>Email: {candidate.email}</p>
                        <p>Skills: {candidate.preferences.skills.join(', ')}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CandidateMatches;