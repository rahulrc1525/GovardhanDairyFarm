import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
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
    fetchFoodRatings,
    foodRatings,
    updateFoodRatings
  } = useContext(StoreContext);
  
  const [quantity, setQuantity] = useState(cart[id] || 0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userCanRate, setUserCanRate] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const ratingData = foodRatings[id] || {};
  const averageRating = ratingData.averageRating || 0;
  const totalRatings = ratingData.totalRatings || 0;

  useEffect(() => {
    if (showRating) {
      if (!ratingData.ratings) {
        fetchFoodRatings(id);
      }
      
      if (orderId && token) {
        checkRatingEligibility();
      }
    }
  }, [id, token, orderId, showRating, ratingData.ratings]);

  const checkRatingEligibility = async () => {
    try {
      setLoadingRating(true);
      
      const response = await axios.get(`${url}/api/rating/check-eligibility`, {
        params: { foodId: id, orderId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUserCanRate(response.data.canRate && !response.data.hasExistingRating);
      }
    } catch (error) {
      console.error("Rating eligibility check failed:", error);
      setUserCanRate(false);
    } finally {
      setLoadingRating(false);
    }
  };

  const handleRatingSubmit = (newRatingData) => {
    updateFoodRatings(id, newRatingData);
    setShowRatingModal(false);
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      let starClass = 'empty';
      if (i <= fullStars) {
        starClass = 'full';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starClass = 'half';
      }

      stars.push(
        <span key={i} className={`star ${starClass}`}>
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

  const handleIncrease = async () => {
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }

    addToCart(id);
    setQuantity(prev => prev + 1);

    try {
      await axios.post(`${url}/api/food/updateclicks`, { id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error updating clicks:", error);
    }
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
            disabled={loadingRating}
          >
            {loadingRating ? "Checking..." : "Rate this item"}
          </button>
        )}
      </div>

      {showRatingModal && (
        <RatingModal
          foodId={id}
          orderId={orderId}
          onClose={() => setShowRatingModal(false)}
          onRatingSubmit={handleRatingSubmit}
          updateFoodRatings={updateFoodRatings}
          url={url}
          token={token}
        />
      )}
    </div>
  );
};

export default FoodItem;