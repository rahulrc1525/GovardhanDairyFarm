import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./RecommendedFood.css";

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
        <div className="recommended-food">
          {recommendedFood.map((item) => (
            <div key={item._id} className="recommended-food-item">
              <img src={`https://govardhandairyfarmbackend.onrender.com/images/${item.image}`} alt={item.name} />
              <p>{item.name}</p>
              <p>Rs. {item.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-recommended-food">No recommended food items available.</p>
      )}
    </div>
  );
}

export default RecommendedFood;
