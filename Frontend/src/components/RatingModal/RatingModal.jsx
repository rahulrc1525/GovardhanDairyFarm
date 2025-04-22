import React, { useState } from 'react';
import './RatingModal.css';

const RatingModal = ({ 
  foodId, 
  orderId, 
  onClose, 
  url, 
  token
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [review, setReview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${url}/api/rating/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          foodId,
          orderId,
          rating,
          review
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Rating submission failed");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Rating submission error:", error);
      setError(error.message || "Failed to submit rating. Please try again.");
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
            <p>Your rating was submitted successfully.</p>
          </div>
        ) : (
          <>
            <h2>Rate This Product</h2>
            <p>How would you rate your experience with this item?</p>
            
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
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
              <label htmlFor="review">Your Review (optional):</label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows="3"
                placeholder="Share your experience with this food item..."
                disabled={isSubmitting}
              />
            </div>
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="submit-button"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : "Submit Rating"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;