import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './FoodDisplay.css';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
  const { foodList } = useContext(StoreContext);

  console.log('foodList:', foodList);
  console.log('category:', category);

  const filteredFoodList = category === 'All'
    ? foodList
    : foodList.filter((item) => item.categories && item.categories.includes(category));

  console.log('filteredFoodList:', filteredFoodList);

  return (
    <div className="food-display" id="food-display">
      <h2>Kuch Healthy Ho Jaye...</h2>
      <div className="food-display-list">
        {filteredFoodList.length > 0 ? (
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
