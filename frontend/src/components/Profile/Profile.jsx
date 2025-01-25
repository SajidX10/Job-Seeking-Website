import React, { useContext, useState } from "react";
import { Context } from "../../main";
import "./Profile.css";

const Profile = () => {
  const { user } = useContext(Context);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    location: user.location || '',
    expectedSalary: user.expectedSalary || '',
  });
  const [updatedProfile, setUpdatedProfile] = useState(null); // State to hold updated profile

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the updated data to your backend
    console.log("Updated Profile Data:", formData);
    
    // Update the updatedProfile state to show the updated data
    setUpdatedProfile(formData);
  };

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      {user && user.role === "Job Seeker" ? (
        <form className="profile-details" onSubmit={handleSubmit}>
          <div>
            <label>
              <strong>Name:</strong>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              <strong>Email:</strong>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              <strong>Phone:</strong>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              <strong>Location:</strong>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </label>
          </div>
          <div>
            <label>
              <strong>Expected Salary:</strong>
              <input
                type="number"
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={handleChange}
              />
            </label>
          </div>
          <button type="submit">Update Profile</button>
        </form>
      ) : (
        <p>You are not authorized to view this page.</p>
      )}

      {/* Display updated profile information */}
      {updatedProfile && (
        <div className="updated-profile">
          <h2>Updated Profile</h2>
          <p><strong>Name:</strong> {updatedProfile.name}</p>
          <p><strong>Email:</strong> {updatedProfile.email}</p>
          <p><strong>Phone:</strong> {updatedProfile.phone}</p>
          <p><strong>Location:</strong> {updatedProfile.location || "Not provided"}</p>
          <p><strong>Expected Salary:</strong> {updatedProfile.expectedSalary ? `$${updatedProfile.expectedSalary}` : "Not provided"}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;