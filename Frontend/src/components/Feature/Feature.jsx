import React, { useState, useEffect, useRef } from 'react';
import './Feature.css';
import { assests } from '../../assests/assests';

const Features = () => {
  const [isImageVisible, setIsImageVisible] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsImageVisible(true);
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the image is visible
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

  return (
    <div className="features-section-container">
      {/* Left Side: Image */}
      <div className="features-image">
        <img
          ref={imageRef}
          src={assests.Feature} 
          alt="Govardhan GIR Cow Milk"
          className={`milk-bottle-img ${isImageVisible ? 'animate-image' : ''}`} // Add class dynamically
        />
      </div>

      {/* Right Side: Text and Descriptions */}
      <div className="features-info">
        <h1 className="header-text">
          GIR COW MILK <span className="highlight">HOME DELIVERED</span>
        </h1>

        <div className="features-list">
          <div className="feature-item">
            <i className="icon fa fa-leaf"></i>
            <div className="feature-content">
              <h3>100% NATURAL</h3>
              <p>
                Our cows are naturally Fed on Organically home grown fodder. Free of hormones, antibiotics, and preservatives.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <i className="icon fa fa-leaf"></i>
            <div className="feature-content">
              <h3>FARM FRESH</h3>
              <p>
                Fresh, pure milk delivered from farm to doorstep within 4 hours, ensuring premium quality.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <i className="icon fa fa-heart"></i>
            <div className="feature-content">
              <h3>HAPPY GIR COWS</h3>
              <p>
                Our GIR cows are treated with love and care, providing the best milk naturally.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <i className="icon fa fa-gear"></i>
            <div className="feature-content">
              <h3>HYGIENICALLY PRODUCED</h3>
              <p>
                Our strict hygiene practices ensure clean and safe milk production every day.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <i className="icon fa fa-gear"></i>
            <div className="feature-content">
              <h3>UNPROCESSED MILK</h3>
              <p>
                No pasteurization or homogenization, just pure, nutrient-rich milk straight from the farm.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <i className="icon fa fa-medkit"></i>
            <div className="feature-content">
              <h3>ANTIBIOTIC & HORMONE FREE</h3>
              <p>
                Our cows are raised without harmful antibiotics or growth hormones, ensuring safe and healthy milk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
