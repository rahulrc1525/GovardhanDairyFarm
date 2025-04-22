import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './FoodItem.css';
import RatingModal from '../RatingModal/RatingModal';
import { assests } from '../../assests/assests';

const FoodItem = ({ id, name, price, description, image, orderId, showRating = true }) => {
  const { 
    addToCart, 
    removeFromCart, 
    token, 
    cart, 
    url,
    foodRatings
  } = useContext(StoreContext);
  
  const [quantity, setQuantity] = useState(cart[id] || 0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userCanRate, setUserCanRate] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const ratingData = foodRatings[id] || {};
  const averageRating = ratingData.averageRating || 0;
  const totalRatings = ratingData.totalRatings || 0;

  useEffect(() => {
    if (orderId && token && showRating) {
      checkRatingEligibility();
    }
  }, [orderId, token, showRating]);

  const checkRatingEligibility = async () => {
    try {
      const response = await fetch(`${url}/api/order/userOrders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      if (data.success) {
        const order = data.data.find(o => o._id === orderId);
        if (order?.status === "Delivered") {
          setUserCanRate(true);
        }
      }
    } catch (error) {
      console.error("Error checking rating eligibility:", error);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= averageRating ? 'full' : 'empty'}`}>
          ★
        </span>
      );
    }

    return (
      <div className="stars-display">
        {stars}
        <span className="rating-text">
          {averageRating ? averageRating.toFixed(1) : 'No ratings'} 
          {totalRatings > 0 && ` (${totalRatings})`}
        </span>
      </div>
    );
  };

  const handleIncrease = () => {
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }
    addToCart(id);
    setQuantity(prev => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      removeFromCart(id);
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img 
          className={`food-item-image ${imageLoaded ? 'loaded' : ''}`}
          src={image} 
          alt={name}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && <div className="image-placeholder"></div>}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <h3>{name}</h3>
          {showRating && renderStars()}
        </div>
        <p className="food-item-desc">{description}</p>
        <div className="food-item-bottom">
          <p className="food-item-price">₹{price}</p>
          <div className="food-item-action">
            <img
              src={assests.remove_icon_red}
              alt="Remove"
              onClick={handleDecrease}
            />
            <span>{quantity}</span>
            <img
              src={assests.add_icon_green}
              alt="Add"
              onClick={handleIncrease}
            />
          </div>
        </div>
        {userCanRate && (
          <button 
            className="rate-button"
            onClick={() => setShowRatingModal(true)}
          >
            Rate this item
          </button>
        )}
      </div>

      {showRatingModal && (
        <RatingModal
          foodId={id}
          orderId={orderId}
          onClose={() => setShowRatingModal(false)}
          url={url}
          token={token}
        />
      )}
    </div>
  );
};

export default FoodItem;