import React, { useState } from 'react';
import Header from '../components/Header/Header';
import Features from '../components/Feature/Feature';
import Products from '../components/Products/Products';
import GirCowGheeBenefits from '../components/GirCowGheeBenefits/GirCowGheeBenefits';
import FoodDisplay from '../components/foodDisplay/FoodDisplay';
import RecommendedFood from '../components/RecommendedFood/RecommendedFood';


const Homepage = () => {
  const [category, setCategory] = useState("All");

  return (
    <div className='home' id="home"> 
      <Header />
      <Products category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
      <RecommendedFood />
      <Features />
      <GirCowGheeBenefits />
    </div>
  );
}

export default Homepage;
