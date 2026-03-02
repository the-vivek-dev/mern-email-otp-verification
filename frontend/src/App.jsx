import React, { useState } from "react";
import VerificationCreate from "./components/VerificationCreate.jsx";
import VerificationProcess from "./components/VerificationProcess.jsx";
import { Routes, Route } from "react-router-dom";
import { HiOutlineBellAlert } from "react-icons/hi2";
import Style from "./components/VerificationCreate.module.css";
import PageNotFound from "./components/PageNotFound.jsx";

const App = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCount, setOtpCount] = useState(6);

  const processCredential = (name, email, otpCount) => {
    setName(name);
    setEmail(email);
    setOtpCount(otpCount);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div>
        <div className={Style.alert_icon}>
          <span>
            <HiOutlineBellAlert size={20} />
          </span>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <VerificationCreate processCredential={processCredential} />
            }
          />
          <Route
            path="/send-otp"
            element={
              <VerificationProcess
                name={name || ""}
                email={email || ""}
                otpCount={otpCount}
              />
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>

        <div className={Style.copyright_notice}>
          <footer>
            &copy; {new Date().getFullYear()} Vivek Kumar. All Rights Reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
