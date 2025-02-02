import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assests } from '../../assests/assests';
import { Link as ScrollLink } from 'react-scroll';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, logout } = useContext(StoreContext);
  const navigate = useNavigate();

  return (
    <div className='Navbar'>
      {/* Logo */}
      <Link to='/'>
        <img src={assests.logo} alt="Govardhan Dairy Farm" className='logo' />
      </Link>

      {/* Navbar Menu */}
      <ul className="navbar-menu">
        <li onClick={() => setMenu("home")} className={menu === "home" ? 'active' : ''}>
          <Link to="/">Home</Link>
        </li>
        <li onClick={() => setMenu("products")} className={menu === "products" ? 'active' : ''}>
          <ScrollLink to="products" spy={true} smooth={true} offset={-70} duration={500}>
            Products
          </ScrollLink>
        </li>
        <li onClick={() => setMenu("about_us")} className={menu === "about_us" ? 'active' : ''}>
          <Link to="/AboutUs">About Us</Link>
        </li>
        <li onClick={() => setMenu("blog")} className={menu === "blog" ? 'active' : ''}>
          <Link to="/BlogPage">Blog</Link>
        </li>
        <li onClick={() => setMenu("contact")} className={menu === "contact" ? 'active' : ''}>
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
              <li>
                <img src={assests.bag_icon} alt="bagicon"/>
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assests.logout_icon} alt="logouticon"/>
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
