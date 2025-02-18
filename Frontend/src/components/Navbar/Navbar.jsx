import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assests } from '../../assests/assests';
import { Link as ScrollLink } from 'react-scroll';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalCartAmount, token, logout } = useContext(StoreContext);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className='Navbar'>
      {/* Logo */}
      <Link to='/'>
        <img src={assests.logo} alt="Govardhan Dairy Farm" className='logo' />
      </Link>

      {/* Hamburger Menu for Mobile */}
      <div className="hamburger" onClick={toggleMobileMenu}>
        <div className={`line ${isMobileMenuOpen ? 'line1' : ''}`}></div>
        <div className={`line ${isMobileMenuOpen ? 'line2' : ''}`}></div>
        <div className={`line ${isMobileMenuOpen ? 'line3' : ''}`}></div>
      </div>

      {/* Navbar Menu */}
      <ul className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <li onClick={() => { setMenu("home"); setIsMobileMenuOpen(false); }} className={menu === "home" ? 'active' : ''}>
          <Link to="/">Home</Link>
        </li>
        <li onClick={() => { setMenu("products"); setIsMobileMenuOpen(false); }} className={menu === "products" ? 'active' : ''}>
          <ScrollLink to="products" spy={true} smooth={true} offset={-70} duration={500}>
            Products
          </ScrollLink>
        </li>
        <li onClick={() => { setMenu("about_us"); setIsMobileMenuOpen(false); }} className={menu === "about_us" ? 'active' : ''}>
          <Link to="/AboutUs">About Us</Link>
        </li>
        <li onClick={() => { setMenu("blog"); setIsMobileMenuOpen(false); }} className={menu === "blog" ? 'active' : ''}>
          <Link to="/BlogPage">Blog</Link>
        </li>
        <li onClick={() => { setMenu("contact"); setIsMobileMenuOpen(false); }} className={menu === "contact" ? 'active' : ''}>
          <Link to="/Contact_us">Contact Us</Link>
        </li>
      </ul>

      {/* Navbar Right Section */}
      <div className='Navbar-right'>
        <img src={assests.search} alt='Search_icon' className='searchimg' />
        <div className="navbar-search">
          <Link to='/cart'>
            <img src={assests.basket} alt='basket' className='basketimg' />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {/* SignIn Button or Profile Icon */}
        {!token ? (
          <button onClick={() => setShowLogin(true)} className='signin'>Sign In</button>
        ) : (
          <div className='navbar-profile'>
            <img src={assests.profile_icon} alt='profile_icon' />
            <ul className='nav-profile-dropdown'>
              <li onClick={() => { navigate('/myorders'); setIsMobileMenuOpen(false); }}>
                <img src={assests.bag_icon} alt="bagicon" />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assests.logout_icon} alt="logouticon" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;