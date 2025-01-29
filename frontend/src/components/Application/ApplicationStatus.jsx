import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const ApplicationStatus = ({ application, onStatusUpdate }) => {
  const [status, setStatus] = useState(application.status);
  const [note, setNote] = useState('');

  const handleStatusUpdate = async () => {
    try {
      const response = await axios.patch(
        'https://job-seeking-website-c1ds.onrender.com/api/v1/application/update-status',
        {
          applicationId: application._id,
          status,
          note
        },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      onStatusUpdate && onStatusUpdate();
      setNote('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="status-update-section bg-white p-4 rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>
          <textarea
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="p-2 border rounded w-full"
            rows="2"
          />
        </div>
        <button
          onClick={handleStatusUpdate}
          className="bg-[#2d5649] text-white px-4 py-2 rounded hover:bg-[#184235]"
        >
          Update Status
        </button>
      </div>
    </div>
  );
};

export default ApplicationStatus;