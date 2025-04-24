import React, { useState, useContext } from 'react';
import { FaKey, FaCheck, FaSpinner } from 'react-icons/fa';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import './Login.css';

const ResetPassword = () => {
  const { url } = useContext(StoreContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [data, setData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }
    
    if (data.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await axios.post(`${url}/api/user/reset-password`, {
        token,
        password: data.password
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setData({
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-modal">
        <div className="login-background">
          <h1>Invalid Reset Link</h1>
          <p>The password reset link is invalid or has expired.</p>
          <p>Please request a new password reset link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-modal">
      <div className="login-background">
        <form onSubmit={handleSubmit}>
          <h1>Reset Password</h1>
          {successMessage ? (
            <div className="success-message">
              <FaCheck /> {successMessage}
            </div>
          ) : (
            <>
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="password"
                  value={data.password}
                  placeholder="New Password (min 8 characters)"
                  onChange={onChangeHandler}
                  required
                  minLength="8"
                />
              </div>
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={data.confirmPassword}
                  placeholder="Confirm New Password"
                  onChange={onChangeHandler}
                  required
                  minLength="8"
                />
              </div>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? <FaSpinner className="spinner" /> : "Reset Password"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;