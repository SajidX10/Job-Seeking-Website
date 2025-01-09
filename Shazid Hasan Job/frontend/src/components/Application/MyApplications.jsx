import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModal from "./ResumeModal";
import ApplicationStatus from "./ApplicationStatus";
import InterviewScheduler from "./InterviewScheduler";
import FollowUpSystem from "./FollowUpSystem";
import NotificationCenter from "./NotificationCenter";

const MyApplications = () => {
  const { user } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");

  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  const fetchApplications = async () => {
    try {
      const endpoint = user?.role === "Employer" 
        ? "employer/getall" 
        : "jobseeker/getall";
      
      const response = await axios.get(
        `http://localhost:4000/api/v1/application/${endpoint}`,
        { withCredentials: true }
      );
      setApplications(response.data.applications);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching applications");
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchApplications();
    }
  }, [isAuthorized, user]);

  if (!isAuthorized) {
    navigateTo("/");
    return null;
  }

  const deleteApplication = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/v1/application/delete/${id}`,
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setApplications(prev => prev.filter(app => app._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting application");
    }
  };

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <section className="my_applications page">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h1>{user?.role === "Employer" ? "Applications From Job Seekers" : "My Applications"}</h1>
            {applications.length === 0 ? (
              <h4>No Applications Found</h4>
            ) : (
              applications.map((element) => (
                user?.role === "Employer" ? (
                  <EmployerCard
                    key={element._id}
                    element={element}
                    openModal={openModal}
                    onUpdate={fetchApplications}
                  />
                ) : (
                  <JobSeekerCard
                    key={element._id}
                    element={element}
                    deleteApplication={deleteApplication}
                    openModal={openModal}
                  />
                )
              ))
            )}
          </div>
          
          <div className="lg:col-span-1">
            <NotificationCenter />
          </div>
        </div>
      </div>
      
      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </section>
  );
};

const JobSeekerCard = ({ element, deleteApplication, openModal }) => {
  return (
    <div className="job_seeker_card">
      <div className="detail">
        <p><span>Name:</span> {element.name}</p>
        <p><span>Email:</span> {element.email}</p>
        <p><span>Phone:</span> {element.phone}</p>
        <p><span>Address:</span> {element.address}</p>
        <p><span>Status:</span> {element.status}</p>
        <p><span>CoverLetter:</span> {element.coverLetter}</p>
        
        {element.interview?.scheduled && (
          <div className="mt-4">
            <p><span>Interview Scheduled:</span></p>
            <p>Date: {new Date(element.interview.date).toLocaleString()}</p>
            <p>Type: {element.interview.type}</p>
            {element.interview.location && (
              <p>Location: {element.interview.location}</p>
            )}
          </div>
        )}
      </div>
      
      <div className="resume">
        <img
          src={element.resume.url}
          alt="resume"
          onClick={() => openModal(element.resume.url)}
        />
      </div>

      {/* Updated Button Area */}
      <div className="btn_area">
        {/* Wrap "Delete Application" and "Follow-Up System" inside a vertical container */}
        <div className="btn_group">
          <button onClick={() => deleteApplication(element._id)} className="delete_btn">
            Delete Application
          </button>

          {/* Follow-Up System Section */}
          <div className="follow_up">
            <FollowUpSystem application={element} onFollowUp={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployerCard = ({ element, openModal, onUpdate }) => {
  return (
    <div className="job_seeker_card">
      <div className="detail">
        <p><span>Name:</span> {element.name}</p>
        <p><span>Email:</span> {element.email}</p>
        <p><span>Phone:</span> {element.phone}</p>
        <p><span>Address:</span> {element.address}</p>
        <p><span>CoverLetter:</span> {element.coverLetter}</p>
      </div>
      
      <div className="resume">
        <img
          src={element.resume.url}
          alt="resume"
          onClick={() => openModal(element.resume.url)}
        />
      </div>
      
      <div className="tracking-tools">
        <ApplicationStatus 
          application={element}
          onStatusUpdate={onUpdate}
        />
        
        <InterviewScheduler
          application={element}
          onSchedule={onUpdate}
        />
        
        <FollowUpSystem
          application={element}
          onFollowUp={onUpdate}
        />
      </div>
    </div>
  );
};

export default MyApplications;