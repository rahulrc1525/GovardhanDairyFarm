import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import "./RecommendedFood.css";
import { StoreContext } from '../../context/StoreContext'; // Import the context
import { assests } from '../../assests/assests'; // Import assets if needed

const RecommendedFood = () => {
    const [recommendedFood, setRecommendedFood] = useState([]);
    const { addToCart, removeFromCart, token, cart } = useContext(StoreContext); // Use context for cart functionality

    useEffect(() => {
        const fetchRecommendedFood = async () => {
            try {
                const response = await axios.get(`https://govardhandairyfarmbackend.onrender.com/api/food/recommended`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data.success) {
                    setRecommendedFood(response.data.data);
                } else {
                    console.error("Failed to fetch recommended food:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching recommended food:", error);
            }
        };
        if(token) {
            fetchRecommendedFood();
        }
    }, [token]);

    const handleIncrease = async (id) => {
        if (!token) {
            alert("Please login to add items to cart");
            return;
        }

        addToCart(id);

        // Update clicks globally
        try {
            const response = await axios.post(`https://govardhandairyfarmbackend.onrender.com/api/food/updateclicks`, { id }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.success) {
                console.log("Clicks updated globally");
            } else {
                console.error("Failed to update clicks:", response.data.message);
            }
        } catch (error) {
            console.error("Error updating clicks:", error);
        }

        // Update clicks per user
        try {
            const response = await axios.post(`https://govardhandairyfarmbackend.onrender.com/api/user/updateclick`, { foodId: id }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.success) {
                console.log("User click updated");
            } else {
                console.error("Failed to update user click:", response.data.message);
            }
        } catch (error) {
            console.error("Error updating user click:", error);
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
            {recommendedFood.length > 0 ? (
                <div className="recommended-food-container">
                    {recommendedFood.map((item) => {
                        const quantity = cart[item._id] || 0; // Get quantity from cart
                        return (
                            <div key={item._id} className="recommended-food-item">
                                <img
                                    src={item.image} // Use the full Cloudinary URL directly
                                    alt={item.name}
                                />
                                <h3>{item.name}</h3>
                                <p>Rs. {item.price}</p>
                                <div className="food-item-action">
                                    <img
                                        src={assests.remove_icon_red} // Use your remove icon
                                        alt="Remove"
                                        className="food-item-action-icon"
                                        onClick={() => handleDecrease(item._id)}
                                    />
                                    <span className="quantity-display">{quantity}</span>
                                    <img
                                        src={assests.add_icon_green} // Use your add icon
                                        alt="Add"
                                        className="food-item-action-icon"
                                        onClick={() => handleIncrease(item._id)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="no-recommended-food-message">No recommended food items available.</p>
            )}
        </div>
    );
};

export default RecommendedFood;
