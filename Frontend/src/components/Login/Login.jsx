import React, { useContext, useState } from 'react';
import { FaUser, FaKey, FaEnvelope, FaSpinner } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import './Login.css';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";

const Login = ({ setShowLogin }) => {
  const { url, setAuthData } = useContext(StoreContext);
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        const { token, userId, user } = response.data;
        setAuthData(token, userId, user);
        setShowLogin(false);
      } else {
        setErrorMessage(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "An error occurred during login. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    if (data.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/register`, {
        name: data.name,
        email: data.email,
        password: data.password
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message || "Registration successful! Please check your email to verify your account.");
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setErrorMessage(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "An error occurred during registration. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/forgot-password`, {
        email: data.email
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message || "If this email exists, a reset link has been sent.");
        setData({
          email: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setErrorMessage(response.data.message || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "An error occurred. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    if (data.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/reset-password`, {
        email: data.email,
        password: data.password,
        token: data.resetToken
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message || "Password reset successfully. You can now login.");
        setShowForgotPassword(false);
        setData({
          email: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setErrorMessage(response.data.message || "Password reset failed. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "An error occurred. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsRegisterActive(!isRegisterActive);
    setData({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="login-modal">
      <div className="overlay" onClick={() => setShowLogin(false)}></div>
      <div className="login-background">
        <button className="close-btn" onClick={() => setShowLogin(false)}>
          <IoMdClose size={24} />
        </button>

        {/* Login Form */}
        {!isRegisterActive && !showForgotPassword && (
          <div className="form-box login">
            <form onSubmit={handleLogin}>
              <h1><b>Login</b></h1>
              <div className="input-box">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  placeholder="Email"
                  onChange={onChangeHandler}
                  required
                />
              </div>
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="password"
                  value={data.password}
                  placeholder="Password"
                  onChange={onChangeHandler}
                  required
                />
              </div>
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? <FaSpinner className="spin" /> : "Login"}
              </button>
              <p className="forgot-password-link">
                <a href="#" onClick={() => setShowForgotPassword(true)}>Forgot Password?</a>
              </p>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              {successMessage && <p className="success-message">{successMessage}</p>}
              <div className="register-link">
                <p>
                  Don't have an account?{' '}
                  <a href="#" onClick={toggleForm}>Register</a>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Register Form */}
        {isRegisterActive && !showForgotPassword && (
          <div className="form-box register">
            <form onSubmit={handleRegister}>
              <h1>Register</h1>
              <div className="input-box">
                <FaUser className="icon" />
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  placeholder="Full Name"
                  onChange={onChangeHandler}
                  required
                />
              </div>
              <div className="input-box">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  placeholder="Email"
                  onChange={onChangeHandler}
                  required
                />
              </div>
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="password"
                  value={data.password}
                  placeholder="Password (min 8 characters)"
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
                  placeholder="Confirm Password"
                  onChange={onChangeHandler}
                  required
                  minLength="8"
                />
              </div>
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? <FaSpinner className="spin" /> : "Register"}
              </button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              {successMessage && <p className="success-message">{successMessage}</p>}
              <div className="register-link">
                <p>
                  Already have an account?{' '}
                  <a href="#" onClick={toggleForm}>Login</a>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Forgot Password Form */}
        {showForgotPassword && (
          <div className="form-box forgot-password">
            <form onSubmit={requestPasswordReset}>
              <h1>Reset Password</h1>
              <div className="input-box">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  placeholder="Enter your email"
                  onChange={onChangeHandler}
                  required
                />
              </div>
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? <FaSpinner className="spin" /> : "Send Reset Link"}
              </button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              {successMessage && <p className="success-message">{successMessage}</p>}
              <div className="register-link">
                <p>
                  <a href="#" onClick={() => setShowForgotPassword(false)}>Back to Login</a>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;