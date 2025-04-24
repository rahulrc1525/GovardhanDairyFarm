import React, { useContext, useState } from 'react';
import { FaUser, FaKey, FaEnvelope } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import './Login.css';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";

const Login = ({ setShowLogin }) => {
  const { url, setToken, setUserId } = useContext(StoreContext);
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errorMessage, setErrorMessage] = useState("");

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        const { token, userId } = response.data;
        setToken(token);
        setUserId(userId);
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        setShowLogin(false);
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("Invalid email or password. Please try again.");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    
    // Clear previous errors
  setErrorMessage("");

   // Frontend validation
  const missingFields = [];
  if (!data.name) missingFields.push("Name");
  if (!data.email) missingFields.push("Email");
  if (!data.password) missingFields.push("Password");
  
  if (missingFields.length > 0) {
    setErrorMessage(`Required: ${missingFields.join(", ")}`);
    return;
  }

  if (data.password !== data.confirmPassword) {
    setErrorMessage("Passwords do not match");
    return;
  }

  try {
    const { confirmPassword, ...registrationData } = data;
    const response = await axios.post(
      `${url}/api/user/register`,
      registrationData
    );

    if (response.data.success) {
      alert("Registration successful! Check your email for verification.");
      setIsRegisterActive(false);
      setData({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
      "Registration failed. Please try again.";
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      setErrorMessage(errorMessage);
    } else if (error.response?.status === 500) {
      alert("Account created but verification failed. Contact support.");
    } else {
      setErrorMessage("Something went wrong. Please try again.");
    }
  }
};

// Add email format validation in register form
<input
  type="email"
  name="email"
  value={data.email}
  placeholder="Email"
  onChange={onChangeHandler}
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
  required
/>

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${url}/api/user/reset-password`, {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        alert("Password reset successfully. You can now login.");
        setShowForgotPassword(false);
        setErrorMessage("");
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const toggleForm = () => {
    setErrorMessage("");
    setIsRegisterActive(!isRegisterActive);
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
              <button className="btn-submit" type="submit">Login</button>
              <p className="forgot-password-link">
                <a href="#" onClick={() => setShowForgotPassword(true)}>Forgot Password?</a>
              </p>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <div className="register-link">
                <p>
                  Don’t have an account?{' '}
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
          value={data.name || ""}
          placeholder="Username"
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
          placeholder="Password"
          onChange={onChangeHandler}
          required
        />
      </div>
      <div className="input-box">
        <FaKey className="icon" />
        <input
          type="password"
          name="confirmPassword"
          value={data.confirmPassword || ""}
          placeholder="Confirm Password"
          onChange={onChangeHandler}
          required
        />
      </div>
      <button className="btn-submit" type="submit">Register</button>
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
        {showForgotPassword && (
          <div className="form-box forgot-password">
            <form onSubmit={handleForgotPassword}>
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
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="password"
                  value={data.password}
                  placeholder="New Password"
                  onChange={onChangeHandler}
                  required
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
                />
              </div>
              <button className="btn-submit" type="submit">Reset Password</button>
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