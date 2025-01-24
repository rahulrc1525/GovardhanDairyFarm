import React, { useContext } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
  const { foodList } = useContext(StoreContext);

  const filteredFoodList = category === 'All'
    ? foodList
    : foodList.filter((item) => item.categories && item.categories.includes(category));

  return (
    <div className="food-display" id="food-display">
      <h2>Kuch Healthy Ho Jaye...</h2>
      <div className="food-display-list">
        {filteredFoodList.length > 0 ? (
          filteredFoodList.map((item) => (
            <FoodItem
              key={item.id} // Updated for consistency
              id={item.id}
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
