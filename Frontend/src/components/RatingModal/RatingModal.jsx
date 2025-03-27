import React, { useState } from 'react';
import axios from 'axios';
import './RatingModal.css';

const RatingModal = ({ foodId, orderId, onClose, onRatingSubmit, url, token, updateFoodRatings }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${url}/api/rating/add`,
        {
          userId: localStorage.getItem('userId'),
          foodId,
          orderId,
          rating,
          review: "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Rating submission failed");
      }

      setSuccess(true);
      setTimeout(() => {
        onRatingSubmit(response.data.data.averageRating);
        updateFoodRatings(foodId, response.data.data.averageRating); // Update food ratings
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Rating submission error:", {
        error: err,
        response: err.response?.data,
        config: err.config,
      });

      let errorMessage = "Failed to submit rating";

      if (err.response) {
        if (err.response.data?.missingFields) {
          errorMessage = `Missing fields: ${Object.keys(err.response.data.missingFields)
            .filter((f) => err.response.data.missingFields[f])
            .join(', ')}`;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
          if (err.response.data.details) {
            errorMessage += ` (Details: ${JSON.stringify(err.response.data.details)})`;
          }
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = "No response from server - please try again later";
      } else {
        errorMessage = err.message || "An unknown error occurred";
      }

      setError(errorMessage);
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
            <div className="rating-labels">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Very Good</span>
              <span>Excellent</span>
            </div>
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => setError(null)} className="retry-button">
                  Try Again
                </button>
              </div>
            )}
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
