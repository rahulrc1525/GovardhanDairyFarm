import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assests } from '../../assests/assests';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const FoodItem = ({ id, name, price, description, image, showRating = true }) => {
  const { addToCart, removeFromCart, token, cart, url } = useContext(StoreContext);
  const [quantity, setQuantity] = useState(cart[id] || 0);
  const [showQuantity, setShowQuantity] = useState(false);

  const handleIncrease = async () => {
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }

    addToCart(id);
    setQuantity((prev) => prev + 1);
    setShowQuantity(true);
    setTimeout(() => setShowQuantity(false), 2000); // Hide after 2 seconds

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

  const handleDecrease = () => {
    if (quantity > 0) {
      removeFromCart(id);
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={`https://govardhandairyfarmbackend.onrender.com/images/${image}`}
          alt={name}
        />
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          {showRating && <img src={assests.Rating_starts} alt="Rating" />}
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">Rs. {price}</p>
        <div className="food-item-action">
          <img
            src={assests.remove_icon_red}
            alt="Remove"
            className="food-item-action-icon"
            onClick={handleDecrease}
          />
          <span className="quantity-display">{quantity}</span>
          <img
            src={assests.add_icon_green}
            alt="Add"
            className="food-item-action-icon"
            onClick={handleIncrease}
          />
        </div>
        {showQuantity && <p className="quantity-message">Quantity: {quantity}</p>}
      </div>
    </div>
  );
};

export default FoodItem;
