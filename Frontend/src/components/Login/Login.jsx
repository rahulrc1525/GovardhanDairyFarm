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
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    verificationCode: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requiresPhoneVerification, setRequiresPhoneVerification] = useState(false);

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
    
    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email: data.email,
        phoneNumber: data.phoneNumber,
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
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/register`, {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password
      });

      if (response.data.success) {
        if (response.data.requiresPhoneVerification) {
          setRequiresPhoneVerification(true);
          alert("Registration successful! Please check your phone for the verification code.");
        } else {
          alert(response.data.message || "Registration successful! Please check your email to verify your account.");
          setIsRegisterActive(false);
          setData({
            name: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
            verificationCode: ""
          });
        }
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

  const handlePhoneVerification = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/verify-phone`, {
        phoneNumber: data.phoneNumber,
        code: data.verificationCode
      });

      if (response.data.success) {
        alert("Phone number verified successfully! You can now log in.");
        setRequiresPhoneVerification(false);
        setIsRegisterActive(false);
        setData({
          name: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
          verificationCode: ""
        });
      } else {
        setErrorMessage(response.data.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during phone verification:", error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "An error occurred during verification. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };


  const handleForgotPassword = async (event) => {
    event.preventDefault();
    
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/reset-password`, {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        alert(response.data.message || "Password reset successfully. You can now login.");
        setShowForgotPassword(false);
        setErrorMessage("");
        setData({
          name: "",
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

  const requestPasswordReset = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/forgot-password`, {
        email: data.email
      });

      if (response.data.success) {
        alert(response.data.message || "If this email exists, a reset link has been sent.");
        setShowForgotPassword(false);
        setErrorMessage("");
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
  const toggleForm = () => {
    setErrorMessage("");
    setIsRegisterActive(!isRegisterActive);
    setRequiresPhoneVerification(false);
    setData({
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      verificationCode: ""
    });
  };

  return (
    <div className="login-modal">
      <div className="overlay" onClick={() => setShowLogin(false)}></div>
      <div className="login-background">
        <button className="close-btn" onClick={() => setShowLogin(false)}>
          <IoMdClose size={24} />
        </button>

        {/* Phone Verification Form */}
        {requiresPhoneVerification && (
          <div className="form-box phone-verification">
            <form onSubmit={handlePhoneVerification}>
              <h1>Verify Phone Number</h1>
              <p>We've sent a verification code to {data.phoneNumber}</p>
              <div className="input-box">
                <input
                  type="text"
                  name="verificationCode"
                  value={data.verificationCode}
                  placeholder="Enter verification code"
                  onChange={onChangeHandler}
                  required
                />
              </div>
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? <FaSpinner className="spin" /> : "Verify"}
              </button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
          </div>
        )}

        {/* Login Form */}
        {!isRegisterActive && !showForgotPassword && !requiresPhoneVerification && (
          <div className="form-box login">
            <form onSubmit={handleLogin}>
              <h1><b>Login</b></h1>
              <div className="input-box">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  placeholder="Email or Phone"
                  onChange={onChangeHandler}
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
        {isRegisterActive && !showForgotPassword && !requiresPhoneVerification && (
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
                <FaPhone className="icon" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={data.phoneNumber}
                  placeholder="Phone Number (with country code)"
                  onChange={onChangeHandler}
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
        {showForgotPassword && !requiresPhoneVerification && (
          <div className="form-box forgot-password">
            <form onSubmit={requestPasswordReset}>
              <h1>Reset Password</h1>
              <div className="input-box">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  placeholder="Enter your email or phone"
                  onChange={onChangeHandler}
                  required
                />
              </div>
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? <FaSpinner className="spin" /> : "Send Reset Link"}
              </button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
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