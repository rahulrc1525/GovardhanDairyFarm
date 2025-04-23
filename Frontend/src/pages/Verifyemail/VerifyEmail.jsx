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
      
      // Debug: Log the token we're receiving
      console.log("Verification token from URL:", token);
      
      if (!token) {
        setMessage('Invalid verification link - no token found');
        return;
      }

      try {
        // Debug: Log the API request we're about to make
        console.log("Making verification request to:", 
          `${process.env.REACT_APP_API_URL}/api/user/verify-email?token=${token}`);
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/verify-email`,
          { 
            params: { token },
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        // Debug: Log the full response
        console.log("Verification response:", response);
        
        if (response.data.success) {
          setMessage('Email verified successfully!');
          setIsSuccess(true);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setMessage(response.data.message || 'Email verification failed');
        }
      } catch (error) {
        // Enhanced error logging
        console.error("Verification error details:", {
          message: error.message,
          response: error.response?.data,
          stack: error.stack
        });
        
        setMessage(error.response?.data?.message || 'Error verifying email. Please try again later.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="login-modal">
      <div className="overlay"></div>
      <div className="login-background">
        <div className="form-box">
          <h2>Email Verification</h2>
          <p className={isSuccess ? 'success-message' : 'error-message'}>{message}</p>
          
          {!isSuccess && (
            <div className="verification-help">
              <p>Need help? Try these solutions:</p>
              <ul>
                <li>Make sure you're using the latest link from your email</li>
                <li>Try registering again if the link has expired</li>
                <li>Contact support if the problem persists</li>
              </ul>
              <button 
                onClick={() => navigate('/register')}
                className="btn-submit"
              >
                Register Again
              </button>
            </div>
          )}
          
          {isSuccess && (
            <button 
              onClick={() => navigate('/login')} 
              className="btn-submit"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;