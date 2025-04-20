import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RatingModal = ({ foodId, orderId, onClose }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [userRating, setUserRating] = useState(null);
    const [error, setError] = useState(''); // State to hold error messages
    const [loading, setLoading] = useState(false); // State to indicate loading

    useEffect(() => {
        const fetchUserRating = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/rating/user-rating?foodId=${foodId}&orderId=${orderId}`, {
                    withCredentials: true,
                });
                setUserRating(response.data.data.rating);
                setRating(response.data.data.rating.rating); // Set initial rating
                setReview(response.data.data.rating.review); // Set initial review
                setError('');
            } catch (err) {
                console.error('Error fetching user rating:', err);
                setError('Failed to fetch existing rating. Please try again.'); // Set error message
            } finally {
                setLoading(false);
            }
        };

        fetchUserRating();
    }, [foodId, orderId]);

    const handleSubmit = async () => {
        setLoading(true);
        setError(''); // Clear any previous errors

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/rating/add`,
                { foodId, orderId, rating, review },
                { withCredentials: true }
            );

            if (response.data.success) {
                console.log('Rating submitted successfully:', response.data);
                onClose(); // Close the modal on success
            } else {
                setError(response.data.message || 'Failed to submit rating.'); // Set error message
            }
        } catch (err) {
            console.error('Rating submission error:', err);
            setError('Failed to submit rating. Please try again.'); // Set a generic error message
            if (err.response && err.response.data && err.response.data.errors) {
                // If the backend sends validation errors, display them
                const validationErrors = err.response.data.errors;
                let errorString = '';
                for (const field in validationErrors) {
                    errorString += `${field}: ${validationErrors[field]}\n`;
                }
                setError(errorString);
            } else {
                setError('Failed to submit rating. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rating-modal">
            <h3>Rate this item</h3>
            {error && <div className="error-message">{error}</div>} {/* Display error message */}
            {loading && <div className="loading-message">Loading...</div>} {/* Display loading message */}
            <div>
                <label>Rating:</label>
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                />
            </div>
            <div>
                <label>Review:</label>
                <textarea value={review} onChange={(e) => setReview(e.target.value)} />
            </div>
            <button onClick={handleSubmit} disabled={loading}>
                Submit Rating
            </button>
            <button onClick={onClose} disabled={loading}>
                Cancel
            </button>
        </div>
    );
};

export default RatingModal;
