import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './FoodDisplay.css';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
  const { foodList } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredFoodList, setFilteredFoodList] = useState([]);

  useEffect(() => {
    // Always show loading when category changes or on initial render
    setIsLoading(true);
    
    const filterFoods = () => {
      if (category === 'All') {
        return foodList;
      }
      return foodList.filter(
        (item) => item.categories && item.categories.includes(category)
      );
    };

    // Simulate loading delay (remove or adjust if using real API calls)
    const timer = setTimeout(() => {
      setFilteredFoodList(filterFoods());
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [category, foodList]);

  return (
    <div className="food-display" id="food-display">
      <h2>Discover Nature's Bounty</h2>
      <div className="food-display-list">
        {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
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
        ) : null}
      </div>
    </div>
  );
};

export default FoodDisplay;