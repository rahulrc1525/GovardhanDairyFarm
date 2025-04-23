import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/verify-email`, 
          { params: { token } }
        );

        if (response.data.success) {
          setMessage('Email verified successfully!');
          setIsSuccess(true);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setMessage(response.data.message || 'Email verification failed');
        }
      } catch (error) {
        setMessage(error.response?.data?.message || 'Error verifying email');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <h2>Email Verification</h2>
        <p className={isSuccess ? 'success-message' : 'error-message'}>{message}</p>
        {isSuccess && (
          <button onClick={() => navigate('/login')} className="login-redirect-btn">
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;