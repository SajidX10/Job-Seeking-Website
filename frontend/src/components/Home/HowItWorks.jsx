import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { MdFindInPage } from "react-icons/md";
import { IoMdSend } from "react-icons/io";

const HowItWorks = () => {
  return (
    <>
      <div className="howitworks">
        <div className="container">
          <h3>How JobZee Works</h3>
          <div className="banner">
            <div className="card">
              <FaUserPlus />
              <p>Create Account</p>
              <p>
              Sign up with ease and become a part of our growing community. Whether you're a job seeker or an employer, creating an account is the first step toward exploring exciting opportunities or finding the perfect candidates.
              </p>
            </div>
            <div className="card">
              <MdFindInPage />
              <p>Find a Job/Post a Job</p>
              <p>
              Browse through thousands of job listings tailored to your interests and expertise. Employers can post job openings to connect with skilled professionals and job seekers can apply to their dream roles effortlessly.
              </p>
            </div>
            <div className="card">
              <IoMdSend />
              <p>Apply For Job/Recruit Suitable Candidates</p>
              <p>
              Job seekers can submit applications with a click, while employers can review and recruit top talent for their teams. Achieve your career or hiring goals seamlessly with JobZee's intuitive platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks;
