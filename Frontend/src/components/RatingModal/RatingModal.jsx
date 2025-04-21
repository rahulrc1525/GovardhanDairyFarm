import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RatingModal.css';

const RatingModal = ({ 
  foodId, 
  orderId, 
  onClose, 
  onRatingSubmit, 
  url, 
  token,
  updateFoodRatings 
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [review, setReview] = useState('');
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await axios.get(`${url}/api/rating/check-eligibility`, {
          params: { foodId, orderId },
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.canRate) {
          if (response.data.hasExistingRating) {
            const ratingResponse = await axios.get(`${url}/api/rating/user-rating`, {
              params: { foodId, orderId },
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (ratingResponse.data.success) {
              setExistingRating(ratingResponse.data.data.rating);
              setRating(ratingResponse.data.data.rating.rating);
              setReview(ratingResponse.data.data.rating.review || '');
            }
          }
        } else {
          onClose();
          alert("You are not eligible to rate this item");
        }
      } catch (error) {
        console.error("Error checking rating eligibility:", error);
        onClose();
        alert("Error checking rating eligibility");
      }
    };

    if (foodId && orderId && token) {
      checkEligibility();
    }
  }, [foodId, orderId, token, url, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${url}/api/rating/add`,
        { foodId, orderId, rating, review },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Rating submission failed");
      }

      setSuccess(true);
      
      if (updateFoodRatings) {
        await updateFoodRatings(foodId);
      }

      setTimeout(() => {
        if (onRatingSubmit) onRatingSubmit(response.data.data);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Rating submission error:", error);
      setError(
        error.response?.data?.message || 
        error.message || 
        "Failed to submit rating. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <button className="close-modal" onClick={onClose} disabled={isSubmitting}>
          ×
        </button>
        
        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Thank You!</h3>
            <p>{existingRating ? "Rating updated!" : "Rating submitted!"}</p>
          </div>
        ) : (
          <>
            <h2>{existingRating ? "Update Rating" : "Rate This Item"}</h2>
            
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  disabled={isSubmitting}
                >
                  ★
                </button>
              ))}
            </div>
            
            <div className="review-section">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Your review (optional)"
                disabled={isSubmitting}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? "Processing..." : "Submit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;