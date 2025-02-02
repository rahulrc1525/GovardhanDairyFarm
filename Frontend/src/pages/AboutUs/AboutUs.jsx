import React from 'react';
import './AboutUs.css'; // Import the CSS file
import { assests } from '../../assests/assests';

const AboutUs = () => {
  return (
    <div className="aboutus-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>Welcome to Govardhan Dairy Farm</h1>
          <p>Delivering the Goodness of A2 GIR Cow Milk & Ghee</p>
        </div>
        <div className="hero-image">
          <img src={assests.FarmImage} alt="Farm" />
        </div>
      </section>

      {/* About Us Section */}
      <section className="aboutus-content">
        <h2 className="section-title">About Us</h2>
        <p className="aboutus-description">
          At Govardhan Dairy Farm, we believe in the power of nature and tradition. Our family-owned farm is dedicated to providing pure, fresh A2 GIR Cow milk and Bilona Ghee, produced using ancient, sustainable practices. Our cows graze freely in natural surroundings, ensuring that each product we offer is of the highest quality.
        </p>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-text">
          <h2 className="section-title">Our Mission</h2>
          <p>
            Our mission is to bring you natural, unadulterated dairy products that enhance your health while respecting our animals and environment. We take pride in our traditional Bilona process that preserves the nutrients and purity of our ghee.
          </p>
        </div>
        <div className="mission-image">
          <img src={assests.Whitecalf} alt="Traditional Method" />
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2 className="section-title">Our Core Values</h2>
        <div className="values-grid">
          <div className="value-item">
            <h3>Sustainability</h3>
            <p>Committed to eco-friendly farming and animal care practices.</p>
          </div>
          <div className="value-item">
            <h3>Quality</h3>
            <p>All our products are crafted with attention to purity and nutrition.</p>
          </div>
          <div className="value-item">
            <h3>Tradition</h3>
            <p>We preserve age-old methods to deliver the most authentic products.</p>
          </div>
          <div className="value-item">
            <h3>Health & Wellness</h3>
            <p>Your well-being is at the heart of everything we produce.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
