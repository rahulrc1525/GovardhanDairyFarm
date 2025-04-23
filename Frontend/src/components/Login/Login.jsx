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
  const [isLoading, setIsLoading] = useState(false);

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
        setErrorMessage(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage(
        error.response?.data?.message || 
        "Invalid email or password. Please try again."
      );
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
        password: data.password
      });

      if (response.data.success) {
        alert("Registration successful! Please check your email to verify your account.");
        setIsRegisterActive(false);
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
      setErrorMessage(
        error.response?.data?.message || 
        "An error occurred during registration. Please try again."
      );
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
        token: data.token, // You'll need to get this from the URL in a real implementation
        password: data.password
      });

      if (response.data.success) {
        alert("Password reset successfully. You can now login with your new password.");
        setShowForgotPassword(false);
        setErrorMessage("");
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
      setErrorMessage(
        error.response?.data?.message || 
        "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setErrorMessage("");
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
              <button 
                className="btn-submit" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
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
              <button 
                className="btn-submit" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
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
              <button 
                className="btn-submit" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
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