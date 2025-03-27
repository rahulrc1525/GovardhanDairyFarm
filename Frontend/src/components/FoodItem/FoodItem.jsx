import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './FoodItem.css';
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
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userCanRate, setUserCanRate] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);
  const [ratingError, setRatingError] = useState(null);

  const ratingData = foodRatings[id] || {};
  const averageRating = ratingData.averageRating || 0;

  useEffect(() => {
    const checkRatingEligibility = async () => {
      if (!token || !orderId) return;
      
      try {
        setLoadingRating(true);
        setRatingError(null);
        
        // Check if order is delivered and contains this item
        const orderResponse = await axios.get(`${url}/api/order/userOrders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const order = orderResponse.data.data.find(o => o._id === orderId);
        
        if (order && 
            order.status === "Delivered" &&
            order.items.some(item => item._id === id)) {
          
          // Check if already rated
          await fetchFoodRatings(id);
          const userId = localStorage.getItem('userId');
          const alreadyRated = ratingData.ratings?.some(r => 
            r.userId._id === userId || r.userId.toString() === userId
          );
          
          setUserCanRate(!alreadyRated);
        }
      } catch (error) {
        console.error("Rating eligibility check failed:", error);
        setRatingError("Failed to check rating eligibility");
      } finally {
        setLoadingRating(false);
      }
    };

    if (showRating && !ratingData.ratings) {
      fetchFoodRatings(id);
    }

    if (showRating && orderId) {
      checkRatingEligibility();
    }
  }, [id, token, orderId, showRating, fetchFoodRatings, ratingData.ratings]);

  const handleRatingSubmit = async (newRating) => {
    try {
      await fetchFoodRatings(id);
      setShowRatingModal(false);
    } catch (error) {
      console.error("Error refreshing ratings:", error);
    }
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
        <img className="food-item-image" src={image} alt={name} />
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <h3>{name}</h3>
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
        {ratingError && <p className="rating-error">{ratingError}</p>}
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