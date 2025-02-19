import React, { useContext, useEffect, useState } from "react";
import "./Placeorder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { cart, token, foodList, url, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();

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
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpay = async () => {
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => console.error("Failed to load Razorpay SDK");
        document.body.appendChild(script);
      } else {
        setRazorpayLoaded(true);
      }
    };
    loadRazorpay();
  }, []);

  // Calculate Subtotal & Total
  const subtotal = Object.keys(cart).reduce((acc, itemId) => {
    const itemInfo = foodList.find((product) => product._id === itemId);
    return itemInfo ? acc + itemInfo.price * cart[itemId] : acc;
  }, 0);
  const deliveryFee = subtotal > 0 ? 100 : 0;
  const total = subtotal + deliveryFee;

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

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
      userId: token,
      items: orderItems,
      amount: total * 100, // Convert to paise for Razorpay
      address: data,
    };

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://govardhandairyfarmbackend.onrender.com/api/order/place",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const result = await response.json();
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
    if (!razorpayLoaded || !window.Razorpay) {
      alert("Razorpay SDK not loaded. Try again.");
      return;
    }

    const options = {
      key: "rzp_test_bLYiZbozwEBRbx",
      amount: order.amount, // Amount is already in paise
      currency: order.currency,
      name: "Govardhan Dairy Farm",
      description: "Complete your payment",
      order_id: order.id,
      handler: async function (response) {
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
              orderId: order.receipt,
            }),
          });

          const verificationResult = await verificationResponse.json();

          if (verificationResponse.ok && verificationResult.success) {
            alert("Payment successful!");
            setCartItems({}); // Clear the cart after successful payment
            navigate("/myorders"); // Redirect to MyOrders page after successful payment
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

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="place-order-container">
      <div className="delivery-info">
        <h2 className="section-title">Delivery Information</h2>
        <form onSubmit={placeOrder} className="delivery-form">
          {[
            "firstName",
            "lastName",
            "email",
            "street",
            "city",
            "state",
            "ZipCode",
            "phone",
          ].map((field) => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>
                {field.replace(/([A-Z])/g, " $1")}
              </label>
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
          <p>
            Subtotal: <span className="summary-value">Rs. {subtotal}</span>
          </p>
          <p>
            Delivery Fees:{" "}
            <span className="summary-value">Rs. {deliveryFee}</span>
          </p>
          <p className="total-amount">
            Total: <span className="summary-value">Rs. {total}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;