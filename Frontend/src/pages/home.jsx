import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Features from '../components/Feature/Feature';
import Products from '../components/Products/Products';
import GirCowGheeBenefits from '../components/GirCowGheeBenefits/GirCowGheeBenefits';
import FoodDisplay from '../components/foodDisplay/FoodDisplay';
import axios from 'axios';

const url = 'https://govardhandairyfarmbackend.onrender.com'; // Define the url variable

const Homepage = () => {
  const [category, setCategory] = useState("All");
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
    <div className='home' id="home"> 
      <Header />
      <Products category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
      <h2>Recommended Food</h2>
      <div className="recommended-food">
        {recommendedFood.map((item) => (
          <div key={item._id} className="recommended-food-item">
            <img src={`https://govardhandairyfarmbackend.onrender.com/images/${item.image}`} alt={item.name} />
            <p>{item.name}</p>
            <p>Rs. {item.price}</p>
          </div>
        ))}
      </div>
      <Features />
      <GirCowGheeBenefits />
    </div>
  );
}

export default Homepage;
