import React from 'react';
import './WhatsAppbot.css';
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppbot = () => {
    const phone = "7249534046"; // Replace with your WhatsApp number

    const openWhatsApp = () => {
      window.open(`https://wa.me/${phone}`, "_blank"); // Corrected syntax
    };
  
    return (
      <button className="whatsapp-icon" onClick={openWhatsApp}>
        <FaWhatsapp size={32} style={{ color: "white" }} />
      </button>
    );
};

export default WhatsAppbot;
