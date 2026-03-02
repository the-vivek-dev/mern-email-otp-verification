import bcrypt from "bcryptjs";
import OTP from "../models/otp.model.js";
import transporter from "../config/mail.js";
import generateOTP from "../utils/generateOtp.js";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";

const sendMailOtp = async (name, email, otp, minute) => {
  const templatePath = path.resolve("src/template/email.verificationUI.hbs");
  const source = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(source);
  const htmlContent = template({ name, email, otp, minute });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Google Verification Code",
    html: htmlContent,
  });
};

export const sendOtp = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ type: "name", message: "Name is required !" });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ type: "email", message: "Valid email required !" });
    }

    const otpDigitCount = 6;
    const otp = generateOTP(otpDigitCount);
    const minute = 5;
    const hashedOTP = await bcrypt.hash(otp, 10);

    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const info = await sendMailOtp(name, email, otp, minute);

    res.json({
      type: "success",
      message: "OTP Sent Successfully.",
      messageId: info?.messageId,
      otpDigitCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "serverError", message: "Failed to send OTP !" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await OTP.findOne({ email });

    if (!record) {
      return res
        .status(400)
        .json({ type: "otpError", message: "Invalid Email !" });
    }

    //  Step 1: Check if user is blocked
    if (record.blockedUntil && record.blockedUntil > new Date()) {
      return res.status(403).json({
        type: "otpError",
        message: "Too many wrong attempts. Try again later !",
      });
    }

    //  Step 2: Check expiry
    if (record.expiresAt < new Date()) {
      await OTP.deleteMany({ email });
      return res
        .status(400)
        .json({ type: "otpError", message: "OTP Expired !" });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);

    //  Step 3: Wrong OTP
    if (!isMatch) {
      record.attempts += 1;

      // If attempts reach 5 → block for 15 minutes
      if (record.attempts >= 5) {
        record.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        record.attempts = 0; // reset counter after block
      }

      await record.save();

      return res.status(400).json({
        type: "otpError",
        message: "Incorrect OTP !",
      });
    }

    // Step 4: Correct OTP → reset everything
    record.attempts = 0;
    record.blockedUntil = null;

    await OTP.deleteMany({ email });

    res.json({ type: "success", message: "Verification Successful." });
  } catch (error) {
    res.status(500).json({ type: "serverError", message: "Server Error !" });
  }
};