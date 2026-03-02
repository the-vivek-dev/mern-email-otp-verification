import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";

const router = express.Router();

/*
  Email-based OTP Rate Limiter
*/
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 OTP request per email

  keyGenerator: (req) => {
    return req.body.email || ipKeyGenerator(req); // limit based on email and IP
  },

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message:
        "Too many OTP requests for this email. Try again after 15 minutes.",
    });
  },
});

/*
  Routes
*/

router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
