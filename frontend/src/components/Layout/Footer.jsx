import React, { useContext } from "react";
import { Context } from "../../main";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  const { isAuthorized } = useContext(Context);
  return (
    <footer className={isAuthorized ? "footerShow" : "footerHide"}>
      <div>&copy; All Rights Reserved By CSE470_14.</div>
      <div>
        <Link to={"https://github.com/SajidX10/Job-Seeking-Website"} target="_blank">
          <FaGithub />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
