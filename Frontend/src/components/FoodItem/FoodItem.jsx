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
    foodRatings,
    updateFoodRatings
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
        
        // First check if order is delivered
        const orderResponse = await axios.get(`${url}/api/order/userOrders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const order = orderResponse.data.data.find(o => o._id === orderId);
        
        if (!order) {
          setUserCanRate(false);
          return;
        }

        if (order.status === "Delivered" && 
            order.items.some(item => item._id.toString() === id)) {
          
          // Then check if already rated
          await fetchFoodRatings(id);
          const userId = localStorage.getItem('userId');
          const alreadyRated = ratingData.ratings?.some(r => 
            (r.userId._id?.toString() === userId || r.userId.toString() === userId) &&
            r.orderId.toString() === orderId
          );
          
          setUserCanRate(!alreadyRated);
        } else {
          setUserCanRate(false);
        }
      } catch (error) {
        console.error("Rating eligibility check failed:", error);
        setRatingError("Failed to check rating eligibility");
        setUserCanRate(false);
      } finally {
        setLoadingRating(false);
      }
    };

    if (showRating) {
      // Always fetch ratings if not already loaded
      if (!ratingData.ratings) {
        fetchFoodRatings(id).catch(console.error);
      }
      
      // Check eligibility if we have an orderId
      if (orderId) {
        checkRatingEligibility();
      }
    }
  }, [id, token, orderId, showRating, fetchFoodRatings, ratingData.ratings]);

  const handleRatingSubmit = async (newAverage) => {
    try {
      // Refresh the ratings data
      await fetchFoodRatings(id);
      setShowRatingModal(false);
    } catch (error) {
      console.error("Error refreshing ratings:", error);
    }
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

    return stars;
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
                  {ratingData.ratings?.length > 0 && ` (${ratingData.ratings.length})`}
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
          updateFoodRatings={updateFoodRatings}
          url={url}
          token={token}
        />
      )}
    </div>
  );
};

export default FoodItem;
