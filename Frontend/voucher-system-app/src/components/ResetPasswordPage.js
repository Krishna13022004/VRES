import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);

  const navigate = useNavigate();

  // Step 1 → Generate OTP
  const handleGetOtp = () => {
    if (!userId) {
      alert("Please enter your User ID (email).");
      return;
    }
    const otpValue = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(otpValue);
    console.log("Generated OTP:", otpValue);
    alert("OTP has been sent to your registered email (mock).");
    setStep(2);
  };

  // Step 2 → Reset password
  const handleSubmit = (e) => {
    e.preventDefault();

    if (otp !== String(generatedOtp)) {
      alert("Invalid OTP entered.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New Password and Confirm Password do not match.");
      return;
    }

    alert("Password reset successful! You can now log in.");
    navigate("/login"); // ✅ go back to login after success
  };

  const handleCancel = () => {
    setStep(1);
    setUserId("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="page-title">Reset Password</h2>
        {step === 1 ? (
          <form onSubmit={(e) => e.preventDefault()} className="form-grid">
            {/* User ID */}
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter your User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>

            {/* Buttons */}
            <div className="button-group">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleGetOtp}
              >
                Get OTP
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>

            {/* Back to Login link */}
            <div className="form-footer">
              <button
                type="button"
                className="link-forgot"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Enter OTP */}
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            {/* New Password */}
            <div className="form-group">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Buttons */}
            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>

            {/* Back to Login link */}
            <div className="form-footer">
              <button
                type="button"
                className="link-forgot"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
