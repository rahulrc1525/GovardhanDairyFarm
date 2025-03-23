import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './FoodDisplay.css';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
  const { foodList } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);
  const [filteredFoodList, setFilteredFoodList] = useState([]);

  useEffect(() => {
    // Simulate loading delay for UX or wait for context update
    const timeout = setTimeout(() => {
      if (category === 'All') {
        setFilteredFoodList(foodList);
      } else {
        const filtered = foodList.filter(
          (item) => item.categories && item.categories.includes(category)
        );
        setFilteredFoodList(filtered);
      }
      setLoading(false);
    }, 500); // You can adjust this delay or remove if foodList is async loaded

    return () => clearTimeout(timeout);
  }, [category, foodList]);

  return (
    <div className="food-display" id="food-display">
      <h2> Discover Nature’s Bounty</h2>
      <div className="food-display-list">
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p>Loading products...</p>
          </div>
        ) : filteredFoodList.length > 0 ? (
          filteredFoodList.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))
        ) : (
          <p>No products available for this category.</p>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
