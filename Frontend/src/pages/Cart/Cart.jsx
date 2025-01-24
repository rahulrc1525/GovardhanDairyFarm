import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    addToCart,
    getTotalCartAmount,
    applyPromoCode,
    url,
  } = useContext(StoreContext);
  const navigate = useNavigate();

  const total = getTotalCartAmount();
  const deliveryFee = cart.length > 0 ? 100 : 0;
  const finalTotal = total + deliveryFee;

  const handleApplyPromo = () => {
    const code = document.getElementById("promo-code").value;
    applyPromoCode(code);
  };

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
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={`${url}/images/${item.image}`}
                alt={item.name}
                className="cart-item-image"
              />
              <p className="item-title">{item.name}</p>
              <p className="item-price">Rs. {item.price}</p>
              <div className="cart-quantity">
                <button onClick={() => removeFromCart(item.id, item.name)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
              <p className="item-total">Rs. {item.price * item.quantity}</p>
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id, item.name, true)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="empty-cart-msg">Your cart is empty.</p>
        )}
      </div>

      {cart.length > 0 && (
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
          <div className="promo-section">
            <p>Have a promo code?</p>
            <div className="promo-code">
              <input id="promo-code" type="text" placeholder="Promo Code" />
              <button onClick={handleApplyPromo} className="promo-submit">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
