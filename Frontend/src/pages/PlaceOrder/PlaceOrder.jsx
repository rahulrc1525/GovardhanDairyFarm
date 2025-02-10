import React, { useContext, useEffect, useState } from "react";
import "./Placeorder.css";
import { StoreContext } from "../../context/StoreContext";

const PlaceOrder = () => {
  const { cart, token, foodList, url } = useContext(StoreContext);
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

  // Calculate Subtotal & Total
  const subtotal = Object.keys(cart).reduce((acc, itemId) => {
    const itemInfo = foodList.find((product) => product._id === itemId);
    return itemInfo ? acc + itemInfo.price * cart[itemId] : acc;
  }, 0);
  const deliveryFee = subtotal > 0 ? 100 : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    console.log("Updated Form Data:", data);
  }, [data]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    console.log("Placing Order...");

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
      amount: total * 100,
      address: data,
    };

    console.log("Order Data:", orderData);

    try {
      const response = await fetch(`${url}/api/order/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Correct way to send token
        },
        body: JSON.stringify(orderData),
      });
      

      const result = await response.json();
      console.log("Order Response:", result);

      if (response.status === 201 && result.success) {
        console.log("Order Placed Successfully. Initiating Razorpay Payment...");
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
    console.log("Processing Razorpay Payment for Order ID:", order.id);

    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Try again.");
      return;
    }

    const options = {
      key: "rzp_test_bLYiZbozwEBRbx", // Replace with actual Razorpay public key
      amount: order.amount,
      currency: order.currency,
      name: "Govardhan Dairy Farm",
      description: "Complete your payment",
      order_id: order.id,
      handler: async function (response) {
        console.log("Razorpay Response:", response);
  
        try {
          const verificationResponse = await fetch(`${url}/api/order/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.receipt, // Backend order ID
            }),
          });
  
          const verificationResult = await verificationResponse.json();
  
          if (verificationResponse.ok && verificationResult.success) {
            alert("Payment successful!");
          } else {
            alert("Payment verification failed!");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          alert("Payment verification error. Try again.");
        }
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone,
      },
      theme: {
        color: "#F37254",
      },
    };
  
    const rzp = new Razorpay(options);
    rzp.open();
  };

  return (
    <div className="place-order-container">
      <div className="delivery-info">
        <h2 className="section-title">Delivery Information</h2>
        <form onSubmit={placeOrder} className="delivery-form">
          {["firstName", "lastName", "email", "street", "city", "state", "ZipCode", "phone"].map((field) => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>{field.replace(/([A-Z])/g, " $1")}</label>
              <input
                type={field === "email" ? "email" : "text"}
                id={field}
                name={field}
                onChange={onChangeHandler}
                value={data[field]}
                required
                placeholder={`Enter ${field}`}
              />
            </div>
          ))}
          <button type="submit" className="proceed-btn" disabled={loading}>
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </form>
      </div>

      <div className="cart-totals">
        <h2 className="section-title">Cart Total</h2>
        <div className="summary-details">
          <p>Subtotal: <span className="summary-value">Rs. {subtotal}</span></p>
          <p>Delivery Fees: <span className="summary-value">Rs. {deliveryFee}</span></p>
          <p className="total-amount">Total: <span className="summary-value">Rs. {total}</span></p>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
