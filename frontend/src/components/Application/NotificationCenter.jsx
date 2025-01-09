import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bell, CheckCircle, Mail } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        'http://localhost:4000/api/v1/application/notifications',
        { withCredentials: true }
      );
      setNotifications(response.data.notifications);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching notifications');
      setLoading(false);
    }
  };

  const markAsRead = async (applicationId, notificationIds) => {
    try {
      await axios.patch(
        'http://localhost:4000/api/v1/application/notifications/mark-read',
        { applicationId, notificationIds },
        { withCredentials: true }
      );
      fetchNotifications();
    } catch (error) {
      toast.error('Error marking notifications as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Interview':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'Status Update':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Follow-up':
        return <Mail className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.type === filter
  );

  return (
    <div className="notification-center bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Notifications</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="Status Update">Status Updates</option>
          <option value="Interview">Interviews</option>
          <option value="Follow-up">Follow-ups</option>
        </select>
      </div>
      
      {loading ? (
        <p>Loading notifications...</p>
      ) : filteredNotifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start gap-3 p-3 rounded ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              {getNotificationIcon(notification.type)}
              <div className="flex-1">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.applicationId, [notification._id])}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;