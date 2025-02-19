import React, { useState, useContext } from 'react';
import FoodItem from '../../components/FoodItem/FoodItem';
import './Search.css';
import { StoreContext } from './../../context/StoreContext';

const Search = () => {
  const { foodList } = useContext(StoreContext);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFoodList = foodList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="search-page">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for food items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="search-results">
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
          <p>No food items found.</p>
        )}
      </div>
    </div>
  );
};

export default Search;