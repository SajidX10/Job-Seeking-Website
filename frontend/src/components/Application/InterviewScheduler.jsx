import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const InterviewScheduler = ({ application, onSchedule }) => {
  const [interviewData, setInterviewData] = useState({
    date: '',
    location: '',
    type: 'In-Person',
    notes: ''
  });

  const handleSchedule = async () => {
    try {
      const response = await axios.post(
        'https://job-seeking-website-c1ds.onrender.com/api/v1/application/schedule-interview',
        {
          applicationId: application._id,
          ...interviewData
        },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      onSchedule && onSchedule();
      setInterviewData({
        date: '',
        location: '',
        type: 'In-Person',
        notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error scheduling interview');
    }
  };

  return (
    <div className="interview-scheduler bg-white p-4 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-semibold mb-4">Schedule Interview</h3>
      <div className="flex flex-col gap-4">
        <input
          type="datetime-local"
          value={interviewData.date}
          onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
          className="p-2 border rounded"
        />
        <select
          value={interviewData.type}
          onChange={(e) => setInterviewData({ ...interviewData, type: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="In-Person">In-Person</option>
          <option value="Virtual">Virtual</option>
          <option value="Phone">Phone</option>
        </select>
        <input
          type="text"
          placeholder="Location/Meeting Link"
          value={interviewData.location}
          onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
          className="p-2 border rounded"
        />
        <textarea
          placeholder="Additional Notes"
          value={interviewData.notes}
          onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
          className="p-2 border rounded"
          rows="3"
        />
        <button
          onClick={handleSchedule}
          className="bg-[#2d5649] text-white px-4 py-2 rounded hover:bg-[#184235]"
        >
          Schedule Interview
        </button>
      </div>
    </div>
  );
};

export default InterviewScheduler;