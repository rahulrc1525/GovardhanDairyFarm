import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./ResetPassword.css";
import { FaKey, FaCheck } from "react-icons/fa";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }

    if (formData.password.length < 8) {
      setMessage({ 
        text: "Password must be at least 8 characters", 
        type: "error" 
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || ""}/api/user/reset-password`,
        { token, password: formData.password }
      );

      if (response.data.success) {
        setMessage({ 
          text: "Password reset successfully! Redirecting to login...", 
          type: "success" 
        });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setMessage({ 
          text: response.data.message || "Failed to reset password", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage({ 
        text: error.response?.data?.message || "An error occurred", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Your Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <div className="input-with-icon">
              <FaKey className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                minLength="8"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="input-with-icon">
              <FaCheck className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                minLength="8"
              />
            </div>
          </div>
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;