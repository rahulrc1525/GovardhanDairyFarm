import React, { useState } from 'react';
import axios from 'axios';
import './RatingModal.css';

const RatingModal = ({ foodId, orderId, onClose, onRatingSubmit, url, token }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.post(
        `${url}/api/rating/add`,
        { 
          userId,
          foodId, 
          orderId, 
          rating,
          review: "" 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onRatingSubmit(response.data.averageRating);
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || "Failed to submit rating");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <button className="close-modal" onClick={onClose}>
          ×
        </button>
        
        {success ? (
          <div className="success-message">
            <svg viewBox="0 0 24 24" className="success-icon">
              <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
            </svg>
            <h3>Rating Submitted!</h3>
            <p>Thank you for your feedback</p>
          </div>
        ) : (
          <>
            <h3>Rate this item</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star ${star <= (hover || rating) ? "filled" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  disabled={submitting}
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
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="modal-actions">
              <button 
                onClick={handleSubmit} 
                disabled={submitting || rating === 0}
                className="submit-btn"
              >
                {submitting ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;