import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaKey } from 'react-icons/fa';
import './ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/reset-password`,
        {
          token,
          password: formData.password
        }
      );

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Password reset successfully. Redirecting to login...'
        });
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <FaKey className="icon" />
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
          />
        </div>
        <div className="input-group">
          <FaKey className="icon" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="8"
          />
        </div>
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
        <button type="submit" className="submit-btn">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;