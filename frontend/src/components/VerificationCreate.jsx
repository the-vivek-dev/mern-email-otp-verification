import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Style from "./VerificationCreate.module.css";
import { MdOutlineEmail } from "react-icons/md";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../api.js";
import { useNavigate } from "react-router-dom";

const zodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Mininum 3 chracter required")
    .max(20, "Maximum 20 character allowed !")
    .regex(
      /^[a-zA-Z]+( [a-zA-Z]+)*$/,
      "Only letters and single space allowed !",
    )
    .transform((val) => val.toLowerCase()),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

const VerificationCreate = ({ processCredential }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(zodSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/send-otp", data);
      alert(res?.data?.message);

      const otpCount = res?.data?.otpDigitCount || 6;
      const email = data?.email;

      processCredential(data?.name, email, otpCount);
      navigate("/send-otp");
    } catch (error) {
      const backendError = error?.response?.data;

      if (backendError?.type === "name" || backendError?.type === "email") {
        setError(backendError?.type, {
          message: backendError?.message,
        });
      } else {
        alert(backendError?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={Style.main}>
        <div className={Style.user_verification}>
          <h2>User Verification</h2>
        </div>
        <div className={Style.verification_sms}>
          <span>
            Please enter your name and email to receive a verification code.
          </span>
        </div>
        <div className={Style.form_container}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={Style.label_container}>
              <label>Full Name:</label>
            </div>
            <div>
              <input
                className={Style.input}
                type="text"
                {...register("name")}
              />
              <div>
                {errors.name && (
                  <span className={Style.error_container}>
                    {errors.name.message}
                  </span>
                )}
              </div>
            </div>
            <br />
            <div className={Style.label_container}>
              <label>Email Address:</label>
            </div>
            <div>
              <div className={Style.email_input}>
                <input
                  className={Style.input}
                  type="email"
                  {...register("email")}
                />
                <div className={Style.email_icon}>
                  <MdOutlineEmail size={20} />
                </div>
              </div>
              <div>
                {errors.email && (
                  <span className={Style.error_container}>
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>
            <br />
            <div>
              <button
                disabled={loading}
                type="submit"
                className={`${Style.input} ${Style.btn_sendOtp}`}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationCreate;
