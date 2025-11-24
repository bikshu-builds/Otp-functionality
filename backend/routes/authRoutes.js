// routes/authRoutes.js
import express from "express";
import User from "../model/User.js";
import Otp from "../model/Otp.js";
import { generateOtp, hashOtp, verifyOtpHash } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/mailer.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 * POST /api/auth/send-otp
 * body: { email }
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    // create user if not exists
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }

    const otp = generateOtp(6);
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(
      Date.now() + (Number(process.env.OTP_EXPIRE_MINUTES) || 5) * 60 * 1000
    );

    // remove old OTPs for this email
    await Otp.deleteMany({ email });

    // save new otp
    await Otp.create({ email, otpHash, expiresAt });

    // send email
    await sendOtpEmail(email, otp);

    return res.json({
      message: "OTP sent to your email",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/auth/verify-otp
 * body: { email, otp }
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord)
      return res.status(400).json({ message: "OTP not found. Please request again." });

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired. Please request again." });
    }

    const isValid = await verifyOtpHash(otp, otpRecord.otpHash);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid -> mark user verified
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // remove all OTPs for this email
    await Otp.deleteMany({ email });

    // generate JWT token (optional)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "OTP verified successfully",
      token,
      user: { email: user.email, isVerified: user.isVerified },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
