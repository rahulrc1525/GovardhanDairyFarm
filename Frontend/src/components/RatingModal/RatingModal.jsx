import React, { useState } from 'react';
import axios from 'axios';
import './RatingModal.css';

const RatingModal = ({ foodId, orderId, onClose, onRatingSubmit, url, token }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${url}/api/rating`,
        { foodId, orderId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onRatingSubmit(foodId);
      } else {
        setError("Failed to submit rating. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
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
        {error && <p className="error-message">{error}</p>}
        <div className="modal-actions">
          <button onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting || rating === 0}
            className="submit-btn"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;