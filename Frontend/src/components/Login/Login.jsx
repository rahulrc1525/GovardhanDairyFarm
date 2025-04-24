import React, { useContext, useState } from 'react';
import { FaUser, FaKey, FaEnvelope } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import './Login.css';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";

const Login = ({ setShowLogin }) => {
  const { url, setToken, setUserId } = useContext(StoreContext);
  const [activeForm, setActiveForm] = useState('login'); // 'login', 'register', 'forgot'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email) {
      setError("Email is required");
      return false;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }

    if (activeForm !== 'forgot' && !formData.password) {
      setError("Password is required");
      return false;
    }

    if (activeForm === 'register') {
      if (!formData.name) {
        setError("Name is required");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }

    if (activeForm === 'forgot' && formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let response;
      
      if (activeForm === 'login') {
        response = await axios.post(`${url}/api/user/login`, {
          email: formData.email,
          password: formData.password
        });
        
        if (response.data.success) {
          const { token, userId, name, email } = response.data;
          setToken(token);
          setUserId(userId);
          localStorage.setItem("token", token);
          localStorage.setItem("userId", userId);
          setShowLogin(false);
        }
      } 
      else if (activeForm === 'register') {
        response = await axios.post(`${url}/api/user/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        if (response.data.success) {
          alert(response.data.message);
          setActiveForm('login');
          setError("");
        }
      } 
      else if (activeForm === 'forgot') {
        response = await axios.post(`${url}/api/user/reset-password`, {
          token: formData.resetToken,
          password: formData.password
        });
        
        if (response.data.success) {
          alert("Password reset successfully. You can now login.");
          setActiveForm('login');
          setError("");
        }
      }

      if (response && !response.data.success) {
        setError(response.data.message || "An error occurred");
      }
    } catch (err) {
      console.error(`${activeForm} error:`, err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal">
      <div className="overlay" onClick={() => setShowLogin(false)}></div>
      <div className="login-background">
        <button className="close-btn" onClick={() => setShowLogin(false)}>
          <IoMdClose size={24} />
        </button>

        {activeForm === 'login' && (
          <div className="form-box login">
            <form onSubmit={handleSubmit}>
              <h1><b>Login</b></h1>
              <div className="input-box">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Email"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
              </button>
              <p className="forgot-password-link">
                <a href="#" onClick={() => setActiveForm('forgot')}>
                  Forgot Password?
                </a>
              </p>
              {error && <p className="error-message">{error}</p>}
              <div className="register-link">
                <p>
                  Don't have an account?{' '}
                  <a href="#" onClick={() => setActiveForm('register')}>
                    Register
                  </a>
                </p>
              </div>
            </form>
          </div>
        )}

        {activeForm === 'register' && (
          <div className="form-box register">
            <form onSubmit={handleSubmit}>
              <h1>Register</h1>
              <div className="input-box">
                <FaUser className="icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Email"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="Password (min 8 chars)"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
              </button>
              {error && <p className="error-message">{error}</p>}
              <div className="register-link">
                <p>
                  Already have an account?{' '}
                  <a href="#" onClick={() => setActiveForm('login')}>
                    Login
                  </a>
                </p>
              </div>
            </form>
          </div>
        )}

        {activeForm === 'forgot' && (
          <div className="form-box forgot-password">
            <form onSubmit={handleSubmit}>
              <h1>Reset Password</h1>
              <div className="input-box">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Your Email"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="New Password"
                  onChange={handleChange}
                />
              </div>
              <div className="input-box">
                <FaKey className="icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  placeholder="Confirm New Password"
                  onChange={handleChange}
                />
              </div>
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Reset Password'}
              </button>
              {error && <p className="error-message">{error}</p>}
              <div className="register-link">
                <p>
                  <a href="#" onClick={() => setActiveForm('login')}>
                    Back to Login
                  </a>
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