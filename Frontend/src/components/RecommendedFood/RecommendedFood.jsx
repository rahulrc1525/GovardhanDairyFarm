import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./RecommendedFood.css";
import FoodItem from '../FoodItem/FoodItem';

const url = 'https://govardhandairyfarmbackend.onrender.com';

const RecommendedFood = () => {
  const [recommendedFood, setRecommendedFood] = useState([]);
  
  useEffect(() => {
    const fetchRecommendedFood = async () => {
      try {
        const response = await axios.get(`${url}/api/food/recommended`);
        if (response.data.success) {
          setRecommendedFood(response.data.data);
        } else {
          console.error("Failed to fetch recommended food:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching recommended food:", error);
      }
    };
    fetchRecommendedFood();
  }, []);
  
  return (
    <div>
      <div className="recommended-food-header">
        <span>Our Top Picks</span> for you!
      </div>
      {recommendedFood.length > 0 ? (
        <div className="recommended-food-container">
          {recommendedFood.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              image={item.image}
              showRating={false}
            />
          ))}
        </div>
      ) : (
        <p className="no-recommended-food-message">No recommended food items available.</p>
      )}
    </div>
  );
};

export default RecommendedFood;
