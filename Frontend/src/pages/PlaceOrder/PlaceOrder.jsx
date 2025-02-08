import React, { useContext, useEffect, useState } from "react";
import "./Placeorder.css";
import { StoreContext } from "../../context/StoreContext";

const PlaceOrder = () => {
  const { cart, token, foodList, url, getTotalCartAmount, cartItems } =
    useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    ZipCode: "",
    country: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  useEffect(()=>{
    console.log(data);
  },[data]);

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);

    const orderItems = foodList
      .filter((item) => cart[item._id] > 0)
      .map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: cart[item._id],
      }));

    const orderData = {
      userId: token, // Assuming token is the user ID
      items: orderItems,
      amount: total,
      address: data,
    };

    try {
      const response = await fetch(`${url}/api/order/placeorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        handleRazorpayPayment(result.order);
      } else {
        alert("Failed to create order. Try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (order) => {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_PUBLIC_KEY, // Your Razorpay public key
      amount: order.amount,
      currency: "INR",
      name: "Govardhan Dairy Farm",
      description: "Dairy Product Purchase",
      order_id: order.id, // Order ID from backend
      handler: async function (response) {
        const verifyData = {
          orderId: order.receipt,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };

        try {
          const verifyResponse = await fetch(`${url}/api/order/verifypayment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(verifyData),
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            alert("Payment Successful!");
          } else {
            alert("Payment verification failed.");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Calculate subtotal and total
  const subtotal = Object.keys(cart).reduce((acc, itemId) => {
    const itemInfo = foodList.find((product) => product._id === itemId);
    if (itemInfo) {
      return acc + itemInfo.price * cart[itemId];
    }
    return acc;
  }, 0);
  const deliveryFee = Object.keys(cart).length > 0 ? 100 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="place-order-container">
      <div className="delivery-info">
        <h2 className="section-title">Delivery Information</h2>
        <form onSubmit={placeOrder} className="delivery-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              onChange={onChangeHandler}
              value={data.firstName}
              required
              placeholder="John"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              onChange={onChangeHandler}
              value={data.lastName}
              required
              placeholder="Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail Address</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              required
              placeholder="example@email.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="street">Street</label>
            <input
              type="text"
              id="street"
              name="street"
              onChange={onChangeHandler}
              value={data.street}
              required
              placeholder="1234 Elm St"
            />
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              onChange={onChangeHandler}
              value={data.city}
              required
              placeholder="City Name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              type="text"
              id="state"
              name="state"
              onChange={onChangeHandler}
              value={data.state}
              required
              placeholder="State"
            />
          </div>
          <div className="form-group">
            <label htmlFor="zipCode">Zip Code</label>
            <input
              type="text"
              id="zipCode"
              name="ZipCode"
              onChange={onChangeHandler}
              value={data.ZipCode}
              required
              placeholder="123456"
            />
          </div>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              onChange={onChangeHandler}
              value={data.country}
              required
              placeholder="Country Name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              onChange={onChangeHandler}
              value={data.phone}
              required
              placeholder="3335511111"
            />
          </div>
        </form>
      </div>

      <div className="cart-totals">
        <h2 className="section-title">Cart Total</h2>
        <div className="summary-details">
          <p>Subtotal: <span className="summary-value">Rs. {subtotal}</span></p>
          <p>Delivery Fees: <span className="summary-value">Rs. {deliveryFee}</span></p>
          <p className="total-amount">Total: <span className="summary-value">Rs. {total}</span></p>
          <button type="submit" className="proceed-btn" disabled={loading}>
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
