import React, { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./Products.css";
import { assests } from "../../assests/assests";

const products = [
    { id: 1, src: assests.Feature, name: "All" },
    { id: 2, src: assests.milk, name: "Milk" },
    { id: 3, src: assests.GHEE, name: "Ghee" },
    { id: 4, src: assests.CURD, name: "Curd" },
    { id: 5, src: assests.milk1ltr, name: "Buttermilk" },
    { id: 6, src: assests.CURD, name: "Cow Dung Cake" },
    { id: 7, src: assests.milk1ltr, name: "Gir Gomutra" },
];

const Products = () => {
    const { category, setCategory } = useContext(StoreContext);

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
