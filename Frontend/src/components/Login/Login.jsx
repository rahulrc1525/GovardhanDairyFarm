import React, { useContext, useState } from 'react';
import { FaUser, FaKey, FaEnvelope, FaSpinner } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import './Login.css';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";

const Login = ({ setShowLogin }) => {
  const { url, setAuthData } = useContext(StoreContext);
  const [activeForm, setActiveForm] = useState('login'); // 'login', 'register', 'forgot'
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
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email: data.email,
        password: data.password
      });

      if (response.data.success) {
        const { token, userId, user } = response.data;
        setAuthData(token, userId, user);
        setShowLogin(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        setErrorMessage(
          <span>
            Email not verified. 
            <button 
              type="button" 
              className="link-button"
              onClick={() => handleResendVerification(data.email)}
            >
              Resend verification email
            </button>
          </span>
        );
      } else {
        setErrorMessage(error.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords don't match");
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
        alert(response.data.message);
        setActiveForm('login');
        setData({ name: "", email: "", password: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/forgot-password`, {
        email: data.email
      });

      if (response.data.success) {
        alert(response.data.message);
        setActiveForm('login');
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (email) => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post(`${url}/api/user/resend-verification`, {
        email
      });

      if (response.data.success) {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to resend verification");
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setData({ name: "", email: "", password: "", confirmPassword: "" });
    setErrorMessage("");
  };

  return (
    <div className="login-modal">
      <div className="overlay" onClick={() => setShowLogin(false)}></div>
      <div className="login-background">
        <button className="close-btn" onClick={() => setShowLogin(false)}>
          <IoMdClose size={24} />
        </button>

        {/* Login Form */}
        {activeForm === 'login' && (
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
                <button 
                  type="button" 
                  className="link-button"
                  onClick={() => { setActiveForm('forgot'); clearForm(); }}
                >
                  Forgot Password?
                </button>
              </p>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <div className="register-link">
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    className="link-button"
                    onClick={() => { setActiveForm('register'); clearForm(); }}
                  >
                    Register
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Register Form */}
        {activeForm === 'register' && (
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
              <div className="register-link">
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="link-button"
                    onClick={() => { setActiveForm('login'); clearForm(); }}
                  >
                    Login
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Forgot Password Form */}
        {activeForm === 'forgot' && (
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
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? <FaSpinner className="spin" /> : "Send Reset Link"}
              </button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <div className="register-link">
                <p>
                  <button 
                    type="button" 
                    className="link-button"
                    onClick={() => { setActiveForm('login'); clearForm(); }}
                  >
                    Back to Login
                  </button>
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