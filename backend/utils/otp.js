// utils/otp.js
import bcrypt from "bcrypt";

export function generateOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // 0-9
  }
  return otp;
}

export async function hashOtp(otp) {
  const saltRounds = 10;
  return bcrypt.hash(otp, saltRounds);
}

export async function verifyOtpHash(plainOtp, hash) {
  return bcrypt.compare(plainOtp, hash);
}
