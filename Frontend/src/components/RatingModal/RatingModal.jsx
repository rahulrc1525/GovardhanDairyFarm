import React, { useState } from 'react';
import './RatingModal.css';
import axios from 'axios';
import { assests } from './../../assests/assests';

const RatingModal = ({ foodId, orderId, onClose, onRatingSubmit, url, token }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${url}/api/rating/add`, {
        userId: localStorage.getItem('userId'),
        foodId,
        orderId,
        rating,
        review
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onRatingSubmit(response.data.averageRating);
        onClose();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating");
    }
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <button className="close-btn" onClick={onClose}>
          <img src={assests.cross_icon} alt="Close" />
        </button>
        <h2>Rate this product</h2>
        <div className="stars">
          {[...Array(5)].map((star, index) => {
            index += 1;
            return (
              <button
                type="button"
                key={index}
                className={index <= (hover || rating) ? "on" : "off"}
                onClick={() => setRating(index)}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(rating)}
              >
                <span className="star">&#9733;</span>
              </button>
            );
          })}
        </div>
        <textarea
          placeholder="Share your experience (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Rating
        </button>
      </div>
    </div>
  );
};

export default RatingModal;