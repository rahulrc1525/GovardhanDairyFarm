import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import "./RecommendedFood.css";
import { StoreContext } from '../../context/StoreContext';
import { assests } from './../../assests/assests';

const RecommendedFood = () => {
    const [recommendedFood, setRecommendedFood] = useState([]);
    const { url, cart, addToCart, removeFromCart, token } = useContext(StoreContext);
    const [loading, setLoading] = useState(true);

    const processImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://via.placeholder.com/200x150?text=No+Image';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${url}/uploads/${imageUrl}`;
    };

    useEffect(() => {
        const fetchRecommendedFood = async () => {
            try {
                const response = await axios.get(`${url}/api/food/recommended`);
                if (response.data.success) {
                    setRecommendedFood(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
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

        // Update clicks
        try {
            const response = await axios.post(`${url}/api/food/updateclicks`, { id }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.success) {
                console.log("Clicks updated");
            } else {
                console.error("Failed to update clicks:", response.data.message);
            }
        } catch (error) {
            console.error("Error updating clicks:", error);
        }
    };

    const handleDecrease = (id) => {
        if (cart[id] > 0) {
            removeFromCart(id);
        }
    };

    return (
        <div>
            <div className="recommended-food-header">
                <span>Our Top Picks</span> for you!
            </div>
            
            {loading ? (
                <div className="recommended-loading">
                    <div className="loading-spinner"></div>
                </div>
            ) : recommendedFood.length > 0 ? (
                <div className="recommended-food-container">
                    {recommendedFood.map((item) => {
                        const quantity = cart[item._id] || 0;
                        return (
                            <div key={item._id} className="recommended-food-item">
                                <div className="recommended-food-image-container">
                                    <img
                                        src={processImageUrl(item.image)}
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                                        }}
                                    />
                                </div>
                                <h3>{item.name}</h3>
                                <p>₹{item.price}</p>
                                <div className="food-item-action">
                                    {/* Keep existing action buttons */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="no-recommended-food-message">
                    No recommendations available right now. Check back later!
                </p>
            )}
        </div>
    );
};

export default RecommendedFood;