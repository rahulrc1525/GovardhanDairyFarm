import React from 'react';
import './Footer.css';
import { assests } from '../../assests/assests'; // Import logo and icons here
import { Link as ScrollLink } from 'react-scroll';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer id="contact" className="footer">
      <div className="footer-content">
        
        {/* Left Section: Logo and About */}
        <div className="footer-left">
          <img src={assests.logo} alt="Govardhan Dairy Farm Logo" className="footer-logo" />
          <p className="footer-about">
            Govardhan Dairy Farm is committed to providing fresh and pure dairy products,
            straight from our farms to your doorstep.
          </p>
          <div className="footer-social-icons">
            <a href="https://www.instagram.com/govardhan_dairy_farms/" target="_blank" rel="noopener noreferrer">
              <img src={assests.instagrgam_icon} alt="Instagram" />
            </a>
            <a href="mailto:govardhandairyfarms@gmail.com" target="_blank" rel="noopener noreferrer">
              <img src={assests.gmail_icon} alt="Mail" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src={assests.Facebook_icon} alt="Facebook" />
            </a>
          </div>
        </div>

        {/* Middle Section: Company Links */}
        <div className="footer-middle">
          <h3>Company</h3>
          <ul className="footer-links">
            <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
            <li><Link to="/AboutUs" onClick={scrollToTop}>About Us</Link></li>
            <li><ScrollLink to="products" spy={true} smooth={true} offset={-70} duration={500}>Products</ScrollLink></li>
            <li><Link to="/BlogPage" onClick={scrollToTop}>Blog</Link></li>
            <li><ScrollLink to="contact" spy={true} smooth={true} offset={-70} duration={500}>Contact Us</ScrollLink></li>
            <li><Link to="/return-refund-policy" onClick={scrollToTop}>Return & Refund Policy</Link></li>
    <li><Link to="/privacy-policy" onClick={scrollToTop}>Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Right Section: Get in Touch */}
        <div className="footer-right">
          <h2>GET IN TOUCH</h2>
          <p className="footer-contact">
            If you have any questions, feel free to reach out to us!
          </p>
          <p className="footer-contact">
            <strong>Email:</strong> <a href="mailto:govardhandairyfarms@gmail.com">govardhandairyfarms@gmail.com</a>
          </p>
          <p className="footer-contact">
            <strong>Phone:</strong> +91 96192 24145
          </p>
          <p className="footer-contact">
            <strong>Address:</strong> Vehale, Vasind Murbad Road, Maharashtra 421601, India
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>&copy; 2024 Govardhan Dairy Farm. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
