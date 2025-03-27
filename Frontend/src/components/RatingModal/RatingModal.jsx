import React, { useState } from 'react';
import axios from 'axios';
import './RatingModal.css';
import { motion } from 'framer-motion';

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
        onRatingSubmit();
      } else {
        setError(response.data.message || "Failed to submit rating");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="rating-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="rating-modal"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
      >
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
          <motion.button 
            onClick={onClose} 
            disabled={submitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button 
            onClick={handleSubmit} 
            disabled={submitting || rating === 0}
            className="submit-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RatingModal;