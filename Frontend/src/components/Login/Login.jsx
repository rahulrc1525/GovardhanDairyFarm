import React, { useContext, useState, useEffect } from 'react';
import { FaUser, FaKey, FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import './Login.css';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";
import validator from 'validator';

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
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState(null);

  // Debounce function
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Email validation
  const validateEmail = async (email) => {
    if (!validator.isEmail(email)) {
      setEmailStatus('invalid');
      setEmailSuggestion(null);
      return;
    }

    setEmailStatus('checking');
    try {
      const response = await axios.post(`${url}/api/user/check-email`, { email });
      
      if (response.data.success) {
        if (response.data.exists) {
          setEmailStatus('taken');
        } else if (!response.data.valid) {
          setEmailStatus('invalid');
          setEmailSuggestion(response.data.suggestion || null);
        } else if (response.data.disposable) {
          setEmailStatus('disposable');
        } else {
          setEmailStatus('available');
          setEmailChecked(true);
        }
      } else {
        setEmailStatus('error');
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailStatus('error');
    }
  };

  const debouncedValidateEmail = debounce(validateEmail, 500);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'email' && isRegisterActive) {
      setEmailChecked(false);
      debouncedValidateEmail(value);
    }
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
      setErrorMessage(error.response?.data?.message || "Invalid email or password. Please try again.");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    
    if (!emailChecked) {
      setErrorMessage("Please verify your email first");
      return;
    }

    if (data.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await axios.post(`${url}/api/user/register`, {
        name: data.name,
        email: data.email,
        password: data.password
      });

      if (response.data.success) {
        alert(response.data.message || "Registration successful! Please check your email to verify your account.");
        setIsRegisterActive(false);
        setErrorMessage("");
        setData({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage(error.response?.data?.message || "An error occurred during registration. Please try again.");
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${url}/api/user/reset-password`, {
        token: data.token, // You'll need to capture this from URL if implementing properly
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
      setErrorMessage(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  const toggleForm = () => {
    setErrorMessage("");
    setEmailStatus(null);
    setEmailChecked(false);
    setEmailSuggestion(null);
    setIsRegisterActive(!isRegisterActive);
  };

  const renderEmailStatus = () => {
    if (!isRegisterActive || !data.email) return null;
    
    switch(emailStatus) {
      case 'checking':
        return <p className="email-status checking">Checking email validity...</p>;
      case 'available':
        return <p className="email-status available"><FaCheck /> Email is valid and available!</p>;
      case 'taken':
        return <p className="email-status taken"><FaTimes /> Email is already registered</p>;
      case 'invalid':
        return (
          <p className="email-status invalid">
            <FaTimes /> Invalid email address
            {emailSuggestion && (
              <span> Did you mean <a href="#" onClick={(e) => {
                e.preventDefault();
                setData(prev => ({...prev, email: emailSuggestion}));
                validateEmail(emailSuggestion);
              }}>{emailSuggestion}</a>?</span>
            )}
          </p>
        );
      case 'disposable':
        return <p className="email-status disposable"><FaTimes /> Disposable emails are not allowed</p>;
      case 'error':
        return <p className="email-status error"><FaTimes /> Error verifying email</p>;
      default:
        return null;
    }
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
                {renderEmailStatus()}
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
              <button 
                className="btn-submit" 
                type="submit"
                disabled={!emailChecked || emailStatus === 'taken'}
              >
                Register
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