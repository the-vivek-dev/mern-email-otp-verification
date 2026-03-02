import React, { useEffect, useRef, useState } from "react";
import Style from "./VerificationCreate.module.css";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

const VerificationProcess = ({ name, email, otpCount }) => {
  const [verificationStatus, setVerificationStatus] = useState("");
  const [responseType, setResponseType] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpStore, setOtpStore] = useState([]);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRefs = useRef([]);

  const inputs = Array(otpCount).fill("");

  const handleChange = async (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    setOtpStore((prev) => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });

    // if value entered then move to next otp box
    if (value && index < otpCount - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otpStore[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight") {
      if (index < otpCount - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData("text");

    const numbersOnly = pastedData.replace(/[^0-9]/g, "");

    if (!numbersOnly) return;

    const otpArray = numbersOnly.slice(0, otpCount).split("");

    setOtpStore(otpArray);
  };

  const verifyOtp = async () => {
    const otp = otpStore.join("");
    if (otp.length !== otpCount) return;
    setLoading(true);
    try {
      const res = await api.post("/verify-otp", { email, otp });
      setVerificationStatus(res?.data?.message || "");
      setResponseType(res?.data?.type);

      //reset otp box
      setOtpStore([]);
      // navigate to home page
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      setVerificationStatus(error?.response?.data?.message || "");
      setResponseType(error?.response?.data?.type);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      const res = await api.post("/send-otp", { name, email });

      setVerificationStatus(res?.data?.message || "");
      setResponseType(res?.data?.type);
    } catch (error) {
      setVerificationStatus(error?.response?.data?.message || "");
      setResponseType(error?.response?.data?.type);
    }
  };

  // auto submit
  // useEffect(() => {
  //   const otp = otpStore.join("");
  //   if (otp.length === otpCount) {
  //     verifyOtp();
  //   }
  // }, [otpStore]);

  useEffect(() => {
    if (!name || !email) {
      navigate("/");
    }
  }, [name, email, navigate]);

  return (
    <div>
      <div className={Style.main}>
        <div className={Style.user_verification}>
          <h2>Enter OTP</h2>
        </div>
        <div className={Style.verification_sms}>
          <span>
            A One-Time Password (OTP) has been sent to <a href="#">{email}</a>
            please check your inbox and enter it below.
          </span>
        </div>
        <div className={Style.form_container}>
          <form>
            <label className={Style.otp_label}>OTP (One-Time Password):</label>

            <div className={Style.otp_container_main}>
              <span
                className={Style.otp_container}
                ref={containerRef}
                style={
                  responseType === "success"
                    ? { boxShadow: "3px 3px 20px 4px green" }
                    : responseType !== ""
                      ? { boxShadow: "3px 3px 20px 4px red" }
                      : {}
                }
              >
                {inputs.map((_, index) => {
                  return (
                    <input
                      key={index}
                      data-index={index}
                      type="text"
                      disabled={loading}
                      value={otpStore[index] || ""}
                      maxLength={1}
                      inputMode="numeric"
                      ref={(el) => (inputRefs.current[index] = el)}
                      onChange={(e) => handleChange(e, index)}
                      onPaste={handlePaste}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                  );
                })}
              </span>
            </div>

            <br />
            <div
              className={Style.invalid_otp_error}
              style={{ color: responseType === "success" ? "green" : "red" }}
            >
              {verificationStatus}
            </div>
            <div>
              <button
                disabled={loading}
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  verifyOtp();
                }}
                className={`${Style.input} ${Style.btn_sendOtp}`}
              >
                {loading ? "verifying..." : " Verify & Continue"}
              </button>
            </div>
            <div className={Style.resend_otp}>
              <span>
                Didn't receive code?
                <button
                  type="button"
                  onClick={() => resendOTP()}
                  className={Style.resend_otp_btn}
                >
                  Resend OTP
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationProcess;
