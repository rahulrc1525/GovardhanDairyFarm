import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './FoodItem.css';
import RatingModal from '../RatingModal/RatingModal';
import { assests } from './../../assests/assests';

const FoodItem = ({ id, name, price, description, image, orderId, showRating = true }) => {
  const { 
    addToCart, 
    removeFromCart, 
    token, 
    cart, 
    url,
    fetchFoodRatings,
    foodRatings
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
      fetchFoodRatings(id);
      
      if (orderId && token) {
        checkRatingEligibility();
      }
    }
  }, [id, token, orderId, showRating]);

  const checkRatingEligibility = async () => {
    try {
      setLoadingRating(true);
      const response = await axios.get(`${url}/api/rating/user-rating`, {
        params: { foodId: id, orderId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserCanRate(response.data.data === null);
    } catch (error) {
      console.error("Rating eligibility check failed:", error);
      setUserCanRate(false);
    } finally {
      setLoadingRating(false);
    }
  };

  const handleRatingSubmit = () => {
    fetchFoodRatings(id);
    setShowRatingModal(false);
  };

  const renderStars = () => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            className={`star ${star <= Math.round(averageRating) ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
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
  };

  const handleDecrease = () => {
    removeFromCart(id);
    setQuantity(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img 
          className={`food-item-image ${imageLoaded ? 'loaded' : ''}`}
          src={image} 
          alt={name}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = assests.placeholder_image;
          }}
        />
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
        {userCanRate && orderId && (
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
          onRatingSubmit={handleRatingSubmit}
          url={url}
          token={token}
        />
      )}
    </div>
  );
};

export default FoodItem;