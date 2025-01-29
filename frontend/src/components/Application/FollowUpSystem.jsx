import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Send } from 'lucide-react';

const FollowUpSystem = ({ application, onFollowUp }) => {
  const [message, setMessage] = useState('');

  const handleFollowUp = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const response = await axios.post(
        'https://job-seeking-website-c1ds.onrender.com/api/v1/application/send-followup',
        {
          applicationId: application._id,
          message
        },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      onFollowUp && onFollowUp();
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending follow-up');
    }
  };

  return (
    <div className="follow-up-system bg-white p-4 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-semibold mb-4">Send Follow-up</h3>
      <div className="flex flex-col gap-4">
        <textarea
          placeholder="Type your follow-up message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-2 border rounded"
          rows="4"
        />
        <button
          onClick={handleFollowUp}
          className="bg-[#2d5649] text-white px-4 py-2 rounded hover:bg-[#184235] flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send Follow-up
        </button>
      </div>
    </div>
  );
};

export default FollowUpSystem;