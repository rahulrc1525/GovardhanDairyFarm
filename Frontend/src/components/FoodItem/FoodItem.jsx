import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assests } from '../../assests/assests';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image }) => {
  const { addToCart, removeFromCart, url } = useContext(StoreContext);
  const [quantity, setQuantity] = useState(0);
  const [showQuantity, setShowQuantity] = useState(false);

  const handleIncrease = () => {
    addToCart({ id, name, price, image }); // Ensure 'id' is passed correctly
    setQuantity((prev) => prev + 1);
    setShowQuantity(true);
    setTimeout(() => setShowQuantity(false), 2000); // Hide after 2 seconds
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      removeFromCart(id);
      setQuantity((prev) => Math.max(prev - 1, 0));
      setShowQuantity(true);
      setTimeout(() => setShowQuantity(false), 1500);
    }
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={`${url}/images/${image}`}
          alt={name}
        />
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assests.Rating_starts} alt="Rating" />
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
