import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setMessage('Invalid verification link - missing token');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Attempting to verify email with token:', token);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/verify-email`,
          {
            params: { token },
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log('Verification response:', response.data);
        
        if (response.data.success) {
          setMessage(response.data.message || 'Email verified successfully!');
          setIsSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setMessage(response.data.message || 'Email verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        
        let errorMessage = 'Error verifying email';
        if (error.response) {
          // Server responded with error status
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
          // Request was made but no response
          errorMessage = 'Network error - please check your connection';
        }
        
        setMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailToken();
  }, [searchParams, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <h2>Email Verification</h2>
        
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <p className={isSuccess ? 'success-message' : 'error-message'}>
            {message}
          </p>
        )}

        {isSuccess && (
          <button 
            onClick={() => navigate('/login')} 
            className="login-redirect-btn"
          >
            Go to Login
          </button>
        )}

        {!isSuccess && !isLoading && (
          <div className="verification-help">
            <p>Need help? Try these solutions:</p>
            <ul>
              <li>Make sure you're using the latest link from your email</li>
              <li>Try registering again if the link has expired</li>
              <li>Contact support if the problem persists</li>
            </ul>
            <button 
              onClick={() => navigate('/register')}
              className="secondary-btn"
            >
              Register Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;