import React, { useContext, useState, useEffect } from 'react';
import './FoodItem.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
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
    foodRatings
  } = useContext(StoreContext);
  
  const [quantity, setQuantity] = useState(cart[id] || 0);
  const [showQuantity, setShowQuantity] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userCanRate, setUserCanRate] = useState(false);

  // Get rating data from context or fetch if needed
  const ratingData = foodRatings[id] || {};
  const averageRating = ratingData.averageRating || 0;

  useEffect(() => {
    const checkRatingEligibility = async () => {
      if (!token || !orderId) return;
      
      try {
        // Check if order is delivered and contains this item
        const orderResponse = await axios.get(`${url}/api/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (orderResponse.data.success && 
            orderResponse.data.status === "Delivered" &&
            orderResponse.data.items.some(item => item._id === id)) {
          
          // Check if already rated
          await fetchFoodRatings(id);
          const userId = localStorage.getItem('userId');
          const alreadyRated = ratingData.ratings?.some(r => r.userId._id === userId);
          
          setUserCanRate(!alreadyRated);
        }
      } catch (error) {
        console.error("Rating eligibility check failed:", error);
      }
    };

    // Initial fetch if no rating data
    if (showRating && !ratingData.ratings) {
      fetchFoodRatings(id);
    }

    if (showRating && orderId) {
      checkRatingEligibility();
    }
  }, [id, token, orderId, showRating, fetchFoodRatings, ratingData.ratings]);

  const handleRatingSubmit = (newAverage) => {
    // Refresh ratings after submission
    fetchFoodRatings(id);
    setShowRatingModal(false);
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span 
        key={star} 
        className={`star ${
          star <= Math.floor(averageRating) ? 'full' :
          (star === Math.ceil(averageRating) && averageRating % 1 >= 0.5 ? 'half' : 'empty')
        }`}
      >
        ★
      </span>
    ));
  };

  const handleIncrease = async () => {
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }

    addToCart(id);
    setQuantity((prev) => prev + 1);
    setShowQuantity(true);
    setTimeout(() => setShowQuantity(false), 2000);

    // Update clicks
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
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={image} alt={name} />
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          {showRating && (
            <div className="food-item-rating">
              <div className="stars-display">
                {renderStars()}
                <span className="rating-text">
                  {averageRating ? averageRating.toFixed(1) : 'No ratings'}
                </span>
              </div>
            </div>
          )}
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">Rs. {price}</p>
        <div className="food-item-action">
          <img
            src={assests.remove_icon_red}
            alt="Remove"
            className="food-item-action-icon"
            onClick={handleDecrease}
          />
          <span className="quantity-display">{quantity}</span>
          <img
            src={assests.add_icon_green}
            alt="Add"
            className="food-item-action-icon"
            onClick={handleIncrease}
          />
        </div>
        {userCanRate && (
          <button 
            className="rate-button" 
            onClick={() => setShowRatingModal(true)}
          >
            Rate this item
          </button>
        )}
        {showQuantity && <p className="quantity-message">Quantity: {quantity}</p>}
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