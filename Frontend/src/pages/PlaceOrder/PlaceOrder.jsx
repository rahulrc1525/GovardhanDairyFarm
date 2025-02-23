import React, { useContext, useEffect, useState } from "react";
import "./Placeorder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API calls

const PlaceOrder = () => {
  const { cart, token, foodList, url, clearCart, userId } = useContext(StoreContext);
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadRazorpay = async () => {
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          console.log("Razorpay SDK loaded successfully");
          setRazorpayLoaded(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay SDK");
          setRazorpayLoaded(false);
        };
        document.body.appendChild(script);
      } else {
        console.log("Razorpay SDK already loaded");
        setRazorpayLoaded(true);
      }
    };
    loadRazorpay();
  }, []);

  const subtotal = Object.keys(cart).reduce((acc, itemId) => {
    const itemInfo = foodList.find((product) => product._id === itemId);
    return itemInfo ? acc + itemInfo.price * cart[itemId] : acc;
  }, 0);
  const deliveryFee = subtotal > 0 ? 100 : 0;
  const total = subtotal + deliveryFee;

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // Function to validate city, state, and pincode
  const validateCityStatePincode = async () => {
    const { ZipCode, city, state } = data;
    let isValid = true;
    const newErrors = {};

    if (!ZipCode || !city || !state) {
      newErrors.ZipCode = "Pincode, city, and state are required";
      isValid = false;
    }

    if (isValid) {
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${ZipCode}`
        );
        const result = await response.json();

        if (result[0].Status === "Error") {
          newErrors.ZipCode = "Invalid pincode";
          isValid = false;
        } else {
          const postOffice = result[0].PostOffice[0];
          if (postOffice.District.toLowerCase() !== city.toLowerCase()) {
            newErrors.city = "City does not match the pincode";
            isValid = false;
          }
          if (postOffice.State.toLowerCase() !== state.toLowerCase()) {
            newErrors.state = "State does not match the pincode";
            isValid = false;
          }
        }
      } catch (error) {
        console.error("Error validating pincode:", error);
        newErrors.ZipCode = "Error validating pincode";
        isValid = false;
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return isValid;
  };

  const validateForm = async () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "street",
      "city",
      "state",
      "ZipCode",
      "phone",
    ];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!data[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Invalid email format";
    }

    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);

    // Validate city, state, and pincode
    const isCityStatePincodeValid = await validateCityStatePincode();
    return Object.keys(newErrors).length === 0 && isCityStatePincodeValid;
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    const isFormValid = await validateForm();
    if (!isFormValid) {
      alert("Please fill all the required fields correctly.");
      return;
    }

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
      amount: total * 100, // Convert amount to paise
      address: data,
      status: "Food Processing",
      userEmail: data.email, // Include user's email in the order data
    };

    console.log("Order Data being sent:", orderData); // Debugging: Log order data

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${url}/api/order/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log("Order Placement Response:", result); // Debugging: Log API response

      if (response.status === 201 && result.success) {
        handleRazorpayPayment(result.order);
      } else {
        alert("Failed to create order. Try again.");
        console.error("Order creation failed. Response:", result); // Debugging: Log failure details
      }
    } catch (error) {
      console.error("Error placing order:", error); // Debugging: Log any errors
      alert("An error occurred while placing the order.");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (order) => {
    if (!razorpayLoaded || !window.Razorpay) {
      console.error("Razorpay SDK not loaded.");
      return;
    }

    const options = {
      key: "rzp_test_K1augfcwb6fgUh", // Replace with your Razorpay key
      amount: order.amount, // Amount is already in paise
      currency: "INR",
      name: "Govardhan Dairy Farm",
      description: "Complete your payment",
      order_id: order.id, // Razorpay order ID
      handler: async function (response) {
        console.log("Razorpay Payment Response:", response);
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
          console.log("Verification Result:", verificationResult);

          if (verificationResponse.ok && verificationResult.success) {
            console.log("Payment successful!");

            // Clear the cart
            await clearCart();

            // Reset the form
            setData({
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

            // Navigate to My Orders
            navigate("/myorders");
          } else {
            console.error("Payment verification failed.");
            // Delete the order if payment verification fails
            await fetch(`${url}/api/order/delete`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orderId: order.receipt }),
            });
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          // Delete the order if there's an error during verification
          await fetch(`${url}/api/order/delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId: order.receipt }),
          });
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
    rzp.on('payment.failed', async function (response) {
      console.error("Payment failed:", response.error);
      // Delete the order if payment fails
      await fetch(`${url}/api/order/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.receipt }),
      });
    });
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
              {errors[field] && (
                <span className="error-message">{errors[field]}</span>
              )}
            </div>
          ))}
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
          <button
            type="submit"
            className="proceed-btn"
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;