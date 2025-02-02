import React from "react";
import "./Products.css";
import { assests } from "../../assests/assests";

const products = [
  { id: 1, src: assests.Feature, name: "All", categories: "All" },
  { id: 2, src: assests.milk, name: "Milk", categories: "Milk" },
  { id: 3, src: assests.GHEE, name: "Ghee", categories: "Ghee" },
  { id: 4, src: assests.CURD, name: "Curd", categories: "Curd" },
  { id: 5, src: assests.bannermilk, name: "Buttermilk", categories: "Buttermilk" },
  { id: 6, src: assests.Cowdung, name: "Cow Dung Cake", categories: "Cow Dung Cake" },
  { id: 7, src: assests.Gomutra250ml, name: "Gir Gomutra", categories: "Gir Gomutra" },
];

const Products = ({ category, setCategory }) => {
  return (
    <div id="products" className="products-section">
      <h2 className="products-title">Explore Our Fresh Dairy Products</h2>
      <p className="products-tagline">
        All Farm Fresh Products Delivered Straight To Your Doorstep...
      </p>
      <div className="products-container">
        {products.map((product) => (
          <div
            key={product.id}
            className={`product-card ${category === product.name ? "active" : ""}`}
            onClick={() => setCategory(product.name)}
          >
            <div className="product-image-container">
              <img src={product.src} alt={product.name} className="product-image" />
            </div>
            <p className="product-name">{product.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
