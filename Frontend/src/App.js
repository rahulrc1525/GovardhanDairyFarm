import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

// React Slick CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Component imports
import Homepage from './pages/home';
import Footer from './components/Footer/Footer';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Navbar from './components/Navbar/Navbar'; 
import Login from './components/Login/Login';
import Products from './components/Products/Products';
import AboutUs from './pages/AboutUs/AboutUs';
import BlogPage from './pages/Blog/BlogPage';
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy';
import ReturnAndRefund from './components/rrpolicy/returnandrefund';
import MyOrders from './pages/MyOrders/MyOrders';
import ContactPage from './pages/Contactus/Contactus';
import Verify from './pages/Verify/Verify';
import WhatsAppbot from './components/WhatsAppbot/WhatsAppbot';
import Search from './pages/Search/Search';
import VerifyEmail from './pages/Verifyemail/VerifyEmail';


const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* Render Login component and pass setShowLogin as a prop */}
      {showLogin && <Login setShowLogin={setShowLogin} />}
      <Navbar setShowLogin={setShowLogin} />
      <div>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/Products" element={<Products />} />
          <Route path="/Contact_us" element={<ContactPage />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/BlogPage" element={<BlogPage />} />
          <Route path="/Return-Refund-Policy" element={<ReturnAndRefund/>}/>
          <Route path="/myorders" element={<MyOrders/>}/>
          <Route path="/verify" element={<Verify/>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/verify-email" element={<VerifyEmail />} />




        </Routes>
      </div>
      <Footer />
      <WhatsAppbot />
    </>
  );
};

export default App;
