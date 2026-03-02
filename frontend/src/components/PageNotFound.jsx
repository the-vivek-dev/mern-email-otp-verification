import React from "react";
import Style from "./VerificationCreate.module.css";
import { Link } from "react-router-dom";


const PageNotFound = () => {
  return (
    <>
      <div className={Style.pagenotfound}>Page Not Found 404 !</div>
      <div className={Style.go_back_home}>
        <Link to="/" className={Style.go_back_link}>
          Go Back Home
        </Link>
      </div>
    </>
  );
};

export default PageNotFound;
