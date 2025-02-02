import React from 'react';
import './privacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-wrapper">
      <header className="privacy-header">
        <h1>Privacy Policy</h1>
        <p>Last Updated: January 22, 2025</p>
      </header>
      
      <div className="privacy-content">
        <section className="privacy-section">
          <h2>Introduction</h2>
          <p>
            Welcome to Govardhan Dairy Farm. We prioritize your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you interact with our website.
          </p>
        </section>

        <section className="privacy-section">
          <h2>What Information We Collect</h2>
          <div className="info-box">
            <h3>1. Personal Information</h3>
            <p>Includes your name, email address, contact details, and payment information collected during account registration or order placement.</p>

            <h3>2. Usage Data</h3>
            <p>Details such as your IP address, browser type, and interaction with our website gathered through cookies and tracking technologies.</p>

            <h3>3. Transaction Information</h3>
            <p>Order details and purchase history to facilitate smooth processing and better service.</p>
          </div>
        </section>

        <section className="privacy-section">
          <h2>How We Use Your Information</h2>
          <p>We use your data for the following purposes:</p>
          <ul className="privacy-list">
            <li>To process and fulfill your orders.</li>
            <li>To enhance your shopping experience with personalized recommendations.</li>
            <li>To ensure compliance with legal and regulatory requirements.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Data Sharing Policy</h2>
          <p>
            We do not sell or rent your personal information. However, we may share your data with:
          </p>
          <ul className="privacy-list">
            <li><strong>Service Providers:</strong> Trusted third parties that assist in payment processing, delivery, and website analytics.</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws, court orders, or governmental requests.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Cookies and Tracking</h2>
          <p>
            Cookies help us improve our website by understanding user behavior. By using our website, you consent to the use of cookies. You can manage your cookie preferences through your browser settings.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Your Privacy Rights</h2>
          <p>You are entitled to:</p>
          <ul className="privacy-list">
            <li>Access, correct, or delete your personal data.</li>
            <li>Restrict data processing under certain circumstances.</li>
            <li>Opt out of receiving promotional communications.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Data Retention</h2>
          <p>
            We retain your data only as long as necessary to fulfill the purposes outlined in this policy or as required by law.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Policy Changes</h2>
          <p>
            We may update this Privacy Policy to reflect changes in our practices or for legal, regulatory, or operational reasons. Any updates will be posted here with a revised "Last Updated" date.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
