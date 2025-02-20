import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";

const Cart = () => {
  const { cart, removeFromCart, foodList, getTotalCartAmount, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const total = getTotalCartAmount();
  const deliveryFee = Object.keys(cart).length > 0 ? 100 : 0;
  const finalTotal = total + deliveryFee;

  return (
    <div className="cart-container">
      <div className="cart-items">
        <div className="cart-header">
          <p>Product</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Action</p>
        </div>
        <hr />

        {Object.keys(cart).length > 0 ? (
          Object.entries(cart).map(([itemId, quantity]) => {
            const itemInfo = foodList.find((product) => product._id === itemId);
            if (!itemInfo) return null;

            return (
              <div key={itemId} className="cart-item">
                <img
                  src={`${url}/images/${itemInfo.image}`}
                  alt={itemInfo.name}
                  className="cart-item-image"
                />
                <p className="item-title">{itemInfo.name}</p>
                <p className="item-price">Rs. {itemInfo.price}</p>
                <div className="cart-quantity">
                  <span>{quantity}</span>
                </div>
                <p className="item-total">Rs. {itemInfo.price * quantity}</p>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(itemId)}
                >
                  Remove
                </button>
              </div>
            );
          })
        ) : (
          <p className="empty-cart-msg">Your cart is empty.</p>
        )}
      </div>

      {Object.keys(cart).length > 0 && (
        <div className="cart-summary">
          <h2 className="cart-totals-title">Cart Totals</h2>
          <div className="summary-details">
            <p>
              Subtotal: <span className="summary-value">Rs. {total}</span>
            </p>
            <p>
              Delivery Fee:{" "}
              <span className="summary-value">Rs. {deliveryFee}</span>
            </p>
            <p className="total-amount">
              Total: <span className="summary-value">Rs. {finalTotal}</span>
            </p>
            <button
              onClick={() => navigate("/order")}
              className="checkout-btn"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;