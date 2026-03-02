import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    attempts: {
      type: Number,
      default: 0,
    },
    blockedUntil: {
      type: Date,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("OTP", otpSchema);
