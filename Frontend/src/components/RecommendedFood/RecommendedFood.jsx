import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import "./RecommendedFood.css";
import { StoreContext } from '../../context/StoreContext';
import { assests } from '../../assests/assests';

const RecommendedFood = () => {
    const [recommendedFood, setRecommendedFood] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart, removeFromCart, token, cart, url } = useContext(StoreContext);

    useEffect(() => {
        const fetchRecommendedFood = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${url}/api/food/recommended`);
                if (response.data.success) {
                    setRecommendedFood(response.data.data);
                } else {
                    setError(response.data.message || "Failed to fetch recommendations");
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Error fetching recommendations");
                console.error("Error fetching recommended food:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendedFood();
    }, [url]);

    const handleIncrease = async (id) => {
        if (!token) {
            alert("Please login to add items to cart");
            return;
        }

        addToCart(id);

        try {
            await axios.post(`${url}/api/food/updateclicks`, { id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Error updating clicks:", err);
        }
    };

    const handleDecrease = (id) => {
        if (cart[id] > 0) {
            removeFromCart(id);
        }
    };

    if (loading) {
        return (
            <div className="recommended-food-loading">
                <div className="loading-spinner"></div>
                <p>Loading recommendations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recommended-food-error">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (recommendedFood.length === 0) {
        return (
            <div className="recommended-food-empty">
                <p>No recommendations available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="recommended-food-container">
            <div className="recommended-food-header">
                <h2>Our Top Picks For You!</h2>
            </div>
            <div className="recommended-food-items">
                {recommendedFood.map((item) => {
                    const quantity = cart[item._id] || 0;
                    return (
                        <div key={item._id} className="recommended-food-item">
                            <div className="food-item-image-container">
                                <img 
                                    src={item.image} 
                                    alt={item.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                    }}
                                />
                                {item.averageRating > 0 && (
                                    <div className="food-item-rating-badge">
                                        ★ {item.averageRating.toFixed(1)}
                                    </div>
                                )}
                            </div>
                            <div className="food-item-details">
                                <h3>{item.name}</h3>
                                <p className="food-item-price">₹{item.price}</p>
                                <div className="food-item-actions">
                                    <button 
                                        onClick={() => handleDecrease(item._id)}
                                        disabled={quantity === 0}
                                    >
                                        <img src={assests.remove_icon_red} alt="Remove" />
                                    </button>
                                    <span>{quantity}</span>
                                    <button onClick={() => handleIncrease(item._id)}>
                                        <img src={assests.add_icon_green} alt="Add" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecommendedFood;