import { useState } from "react";
import api from "../api";

function OtpAuth() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("send");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/send-otp", { email });
      setMessage(res.data.message);
      setStep("verify");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>OTP Authentication</h2>

      {step === "send" && (
        <form onSubmit={handleSendOtp}>
          <div style={{ marginBottom: 12 }}>
            <label>Email</label>
            <input
              type="email"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerifyOtp}>
          <p>OTP sent to: <b>{email}</b></p>
          <div style={{ marginBottom: 12 }}>
            <label>Enter OTP</label>
            <input
              type="text"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            style={{ marginLeft: 10 }}
            onClick={handleSendOtp}
            disabled={loading}
          >
            Resend OTP
          </button>
        </form>
      )}

      {message && <p style={{ color: "green", marginTop: 16 }}>{message}</p>}
      {error && <p style={{ color: "red", marginTop: 16 }}>{error}</p>}
    </div>
  );
}

export default OtpAuth;
