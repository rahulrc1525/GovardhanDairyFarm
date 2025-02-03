import "./Contactus.css";
import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaLocationDot } from "react-icons/fa6";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, message } = formData;
    if (!fullName || !email || !message) {
      setResponseMessage("All fields are required!");
      return;
    }

    try {
      const response = await fetch("https://govardhandairyfarmbackend.onrender.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setResponseMessage("Message sent successfully!");
        setFormData({ fullName: "", email: "", message: "" });
      } else {
        setResponseMessage(data.error || "Failed to send message");
      }
    } catch (error) {
      setResponseMessage("Error sending message!");
    }
  };

  return (
    <div className="contact-page">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          <h1>Have Questions? We’re Here to Help!</h1>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="contact-info">
        <h2>Contact Us</h2>
        <div className="info-section">
          <div className="info-item">
            <FaPhone className="icon" />
            <h3>Phone</h3>
            <p>+91 96192 24145</p>
          </div>
          <div className="info-item">
            <FaEnvelope className="icon" />
            <h3>Email</h3>
            <p>govardhandairyfarms@gmail.com</p>
          </div>
          <div className="info-item">
            <FaLocationDot className="icon" />
            <h3>Address</h3>
            <p>Vehale, Vasind Murbad Road, Maharashtra 421601, India</p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <form onSubmit={handleSubmit}>
          <h2>Send Us a Message</h2>

          <div className="input-box">
            <label htmlFor="full-name">Full Name</label>
            <input
              type="text"
              id="full-name"
              name="fullName"
              className="field"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="field"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="field message"
              placeholder="Write your message here"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>

        {responseMessage && (
          <div className="response-message">{responseMessage}</div>
        )}
      </section>
    </div>
  );
};

export default ContactPage;
