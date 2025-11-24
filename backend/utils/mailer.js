// utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in ${process.env.OTP_EXPIRE_MINUTES || 5} minutes.`,
  };

  return transporter.sendMail(mailOptions);
}
