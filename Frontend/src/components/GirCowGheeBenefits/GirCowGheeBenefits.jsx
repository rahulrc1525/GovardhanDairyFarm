import React from 'react';
import './GirCowGheeBenefits.css';
import { assests } from '../../assests/assests';

const GirCowGheeBenefits = () => {
  return (
    <div className="ghee-benefits-section">
      <div className="benefits-container">
        <div className="benefits-text">
          <h2 className="benefits-title">Benefits of GIR COW GHEE</h2>
          <p className="benefits-tagline">Made by Traditional Bilona Method</p>
          <ul className="benefits-list">
            <li>Rich in Omega-3 and Omega-9 Fatty Acids, essential for heart health.</li>
            <li>Promotes digestion and boosts metabolism.</li>
            <li>Supports joint health and flexibility.</li>
            <li>Highly nutritious and contains fat-soluble vitamins A, D, E, and K.</li>
            <li>Strengthens the immune system.</li>
            <li>Improves skin health and promotes glowing skin.</li>
            <li>Helps in weight management by burning stubborn fat.</li>
          </ul>
        </div>
        <div className="benefits-image-container">
          <img src={assests.eraseghee} alt="GIR Cow Ghee" className="benefits-image" />
        </div>
      </div>
    </div>
  );
};

export default GirCowGheeBenefits;
