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
    const [success, setSuccess] = useState(false);
    const [review, setReview] = useState('');
    const [existingRating, setExistingRating] = useState(null);

    useEffect(() => {
        const fetchUserRating = async () => {
            try {
                const response = await axios.get(`${url}/api/rating/user-rating`, {
                    params: { foodId, orderId },
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success && response.data.data.rating) {
                    setExistingRating(response.data.data.rating);
                    setRating(response.data.data.rating.rating);
                    setReview(response.data.data.rating.review || '');
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    console.error("Error fetching user rating:", error);
                }
            }
        };

        if (foodId && orderId && token) {
            fetchUserRating();
        }
    }, [foodId, orderId, token, url]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) return;

        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${url}/api/rating/add`,
                {
                    foodId,
                    orderId,
                    rating,
                    review,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000
                }
            );

            if (response.data.success) {
                setSuccess(true);
                if (updateFoodRatings) {
                    updateFoodRatings(foodId, response.data.data);
                }
                setTimeout(() => {
                    onClose();
                    if (onRatingSubmit) {
                        onRatingSubmit(response.data.data);
                    }
                }, 1500);
            }
        } catch (error) {
            console.error("Rating submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rating-modal-overlay">
            <div className="rating-modal">
                <button
                    className="close-modal"
                    onClick={onClose}
                    disabled={isSubmitting}
                    aria-label="Close rating modal"
                >
                    ×
                </button>

                {success ? (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Thank You!</h3>
                        <p>{existingRating ? "Your rating was updated successfully." : "Your rating was submitted successfully."}</p>
                    </div>
                ) : (
                    <>
                        <h2>{existingRating ? "Update Your Rating" : "Rate This Product"}</h2>
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
                                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
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

                        <div className="review-section">
                            <label htmlFor="review">Your Review (optional):</label>
                            <textarea
                                id="review"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                rows="3"
                                placeholder="Share your experience with this food item..."
                                disabled={isSubmitting}
                                maxLength="500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || rating === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner"></span>
                                    {existingRating ? "Updating..." : "Submitting..."}
                                </>
                            ) : existingRating ? "Update Rating" : "Submit Rating"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RatingModal;