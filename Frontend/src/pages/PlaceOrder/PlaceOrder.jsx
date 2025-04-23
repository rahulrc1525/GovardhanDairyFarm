import React, { useContext, useEffect, useState } from "react";
import "./Placeorder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

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
    
    if (name === "ZipCode") {
      setPincodeInfo(null);
    }
  };

  const checkPincode = async () => {
    if (!data.ZipCode || data.ZipCode.length !== 6) return;
    
    setIsCheckingPincode(true);
    setErrors(prev => ({ ...prev, ZipCode: "" }));
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${data.ZipCode}`);
      const result = await response.json();
      
      if (result[0].Status === "Error") {
        setErrors(prev => ({ ...prev, ZipCode: "Invalid pincode" }));
        setPincodeInfo(null);
        return;
      }
      
      const postOffices = result[0].PostOffice;
      if (!postOffices || postOffices.length === 0) {
        setErrors(prev => ({ ...prev, ZipCode: "No post offices found for this pincode" }));
        setPincodeInfo(null);
        return;
      }
      
      // Extract unique districts (cities) and states
      const districts = [...new Set(postOffices.map(po => po.District))];
      const states = [...new Set(postOffices.map(po => po.State))];
      
      setPincodeInfo({
        districts,
        state: states[0], // Most pincodes are in one state
        postOffices
      });
      
      // Auto-fill state if empty
      if (!data.state && states.length === 1) {
        setData(prev => ({ ...prev, state: states[0] }));
      }
      
    } catch (error) {
      console.error("Error checking pincode:", error);
      setErrors(prev => ({ ...prev, ZipCode: "Error validating pincode" }));
    } finally {
      setIsCheckingPincode(false);
    }
  };

  // Debounced pincode check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.ZipCode && data.ZipCode.length === 6) {
        checkPincode();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [data.ZipCode]);

  const validateCityState = () => {
    const { city, state } = data;
    const newErrors = {};
    let isValid = true;
    
    if (!pincodeInfo) {
      newErrors.ZipCode = "Please enter a valid pincode first";
      return { isValid: false, newErrors };
    }
    
    // Check if state matches
    if (!state || !pincodeInfo.state.toLowerCase().includes(state.toLowerCase())) {
      newErrors.state = `State should be ${pincodeInfo.state}`;
      isValid = false;
    }
    
    // Check if city matches any district
    if (!city || !pincodeInfo.districts.some(d => 
      d.toLowerCase().includes(city.toLowerCase()) || 
      city.toLowerCase().includes(d.toLowerCase())
    )) {
      newErrors.city = `City should be one of: ${pincodeInfo.districts.join(", ")}`;
      isValid = false;
    }
    
    return { isValid, newErrors };
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

    // Basic field validation
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

    if (data.ZipCode && !/^\d{6}$/.test(data.ZipCode)) {
      newErrors.ZipCode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);

    // Only proceed with city/state validation if basic fields are valid
    if (Object.keys(newErrors).length === 0) {
      const { isValid, newErrors: locationErrors } = validateCityState();
      setErrors(prev => ({ ...prev, ...locationErrors }));
      return isValid;
    }

    return false;
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
      userEmail: data.email,
    };

    console.log("Order Data being sent:", orderData);

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
      console.log("Order Placement Response:", result);

      if (response.status === 201 && result.success) {
        handleRazorpayPayment(result.order);
      } else {
        alert("Failed to create order. Try again.");
        console.error("Order creation failed. Response:", result);
      }
    } catch (error) {
      console.error("Error placing order:", error);
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
      key: "rzp_test_K1augfcwb6fgUh",
      amount: order.amount,
      currency: "INR",
      name: "Govardhan Dairy Farm",
      description: "Complete your payment",
      order_id: order.id,
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

            await clearCart();

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

            navigate("/myorders");
          } else {
            console.error("Payment verification failed.");
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
          
          {/* Pincode validation status */}
          {isCheckingPincode && <p>Validating pincode...</p>}
          
          {/* Pincode information */}
          {pincodeInfo && (
            <div className="pincode-info">
              <h4>Pincode Information:</h4>
              <p><strong>State:</strong> {pincodeInfo.state}</p>
              <p><strong>Valid Cities:</strong> {pincodeInfo.districts.join(", ")}</p>
            </div>
          )}
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