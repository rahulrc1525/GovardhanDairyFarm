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
  const [pincodeSuggestions, setPincodeSuggestions] = useState(null);
  const [manualValidation, setManualValidation] = useState(false);

  // Predefined list of cities, states and pincodes for manual validation
  const cityStatePincodeMap = [
    { city: "Thane", state: "Maharashtra", pincodes: ["400601", "400602", "400603", "400604", "400605"] },
    { city: "Mumbai", state: "Maharashtra", pincodes: ["400001", "400002", "400003", "400004", "400005"] },
    { city: "Pune", state: "Maharashtra", pincodes: ["411001", "411002", "411003", "411004", "411005"] },
    { city: "Nashik", state: "Maharashtra", pincodes: ["422001", "422002", "422003", "422004", "422005"] },
    { city: "Delhi", state: "Delhi", pincodes: ["110001", "110002", "110003", "110004", "110005"] },
    { city: "Bangalore", state: "Karnataka", pincodes: ["560001", "560002", "560003", "560004", "560005"] },
    { city: "Hyderabad", state: "Telangana", pincodes: ["500001", "500002", "500003", "500004", "500005"] },
    { city: "Chennai", state: "Tamil Nadu", pincodes: ["600001", "600002", "600003", "600004", "600005"] },
    { city: "Kolkata", state: "West Bengal", pincodes: ["700001", "700002", "700003", "700004", "700005"] },
    { city: "Ahmedabad", state: "Gujarat", pincodes: ["380001", "380002", "380003", "380004", "380005"] },
  ];

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
      setPincodeSuggestions(null);
    }
  };

  const validateCityStatePincodeManually = () => {
    const { ZipCode, city, state } = data;
    let isValid = true;
    const newErrors = {};
    setPincodeSuggestions(null);

    if (!ZipCode || !city || !state) {
      newErrors.ZipCode = "Pincode, city, and state are required";
      return { isValid: false, newErrors };
    }

    // Basic pincode format check (6 digits for India)
    if (!/^\d{6}$/.test(ZipCode)) {
      newErrors.ZipCode = "Pincode must be 6 digits";
      return { isValid: false, newErrors };
    }

    // Find matching entries in our predefined list
    const matchingEntries = cityStatePincodeMap.filter(entry => 
      entry.city.toLowerCase() === city.toLowerCase() && 
      entry.state.toLowerCase() === state.toLowerCase()
    );

    if (matchingEntries.length === 0) {
      newErrors.city = "City and state combination not found in our delivery areas";
      newErrors.state = "City and state combination not found in our delivery areas";
      isValid = false;
      
      // Show suggestions
      const allCities = [...new Set(cityStatePincodeMap.map(item => item.city))];
      const allStates = [...new Set(cityStatePincodeMap.map(item => item.state))];
      
      setPincodeSuggestions({
        cities: allCities,
        states: allStates,
        message: "We currently deliver to these areas:"
      });
    } else {
      // Check if pincode is valid for this city-state
      const pincodeValid = matchingEntries.some(entry => 
        entry.pincodes.includes(ZipCode)
      );

      if (!pincodeValid) {
        newErrors.ZipCode = `Pincode not valid for ${city}, ${state}. Valid pincodes: ${matchingEntries[0].pincodes.join(", ")}`;
        isValid = false;
        
        setPincodeSuggestions({
          validPincodes: matchingEntries[0].pincodes,
          message: `Valid pincodes for ${city}, ${state}:`
        });
      }
    }

    return { isValid, newErrors };
  };

  const validateCityStatePincodeAPI = async () => {
    const { ZipCode, city, state } = data;
    let isValid = true;
    const newErrors = {};
    setPincodeSuggestions(null);

    if (!ZipCode || !city || !state) {
      newErrors.ZipCode = "Pincode, city, and state are required";
      return { isValid: false, newErrors };
    }

    // Basic pincode format check (6 digits for India)
    if (!/^\d{6}$/.test(ZipCode)) {
      newErrors.ZipCode = "Pincode must be 6 digits";
      return { isValid: false, newErrors };
    }

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${ZipCode}`);
      const result = await response.json();

      if (result[0].Status !== "Success") {
        newErrors.ZipCode = "Invalid pincode";
        return { isValid: false, newErrors };
      }

      const postOffices = result[0].PostOffice;
      
      if (!postOffices || postOffices.length === 0) {
        newErrors.ZipCode = "No post offices found for this pincode";
        return { isValid: false, newErrors };
      }

      // Get all unique districts and states for this pincode
      const uniqueDistricts = [...new Set(postOffices.map(po => po.District))];
      const uniqueStates = [...new Set(postOffices.map(po => po.State))];
      
      // Check if state matches
      const isStateValid = uniqueStates.some(s => 
        s.toLowerCase().includes(state.toLowerCase()) || 
        state.toLowerCase().includes(s.toLowerCase())
      );

      if (!isStateValid) {
        newErrors.state = `State should be one of: ${uniqueStates.join(", ")}`;
        isValid = false;
        setPincodeSuggestions({
          states: uniqueStates,
          districts: uniqueDistricts,
          message: "Based on pincode, valid options are:"
        });
      }

      // Check if city matches (compare with District from API)
      const isCityValid = uniqueDistricts.some(d => 
        d.toLowerCase().includes(city.toLowerCase()) || 
        city.toLowerCase().includes(d.toLowerCase())
      );

      if (!isCityValid) {
        newErrors.city = `City should be one of: ${uniqueDistricts.join(", ")}`;
        isValid = false;
        setPincodeSuggestions({
          states: uniqueStates,
          districts: uniqueDistricts,
          message: "Based on pincode, valid options are:"
        });
      }

    } catch (error) {
      console.error("Error validating pincode:", error);
      newErrors.ZipCode = "Error validating pincode. Please try manual validation.";
      isValid = false;
    }

    return { isValid, newErrors };
  };

  const validateCityStatePincode = async () => {
    if (manualValidation) {
      return validateCityStatePincodeManually();
    } else {
      try {
        return await validateCityStatePincodeAPI();
      } catch (error) {
        console.error("API validation failed, falling back to manual", error);
        return validateCityStatePincodeManually();
      }
    }
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

    setErrors(newErrors);

    // Only proceed with pincode validation if basic fields are valid
    if (Object.keys(newErrors).length === 0) {
      const { isValid, newErrors: pincodeErrors } = await validateCityStatePincode();
      setErrors(prev => ({ ...prev, ...pincodeErrors }));
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
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={manualValidation}
                onChange={() => setManualValidation(!manualValidation)}
              />
              Use manual validation (check if API fails)
            </label>
          </div>
          
          {/* Pincode suggestions */}
          {pincodeSuggestions && (
            <div className="pincode-suggestions">
              <h4>{pincodeSuggestions.message || "Pincode Information:"}</h4>
              {pincodeSuggestions.districts && (
                <p><strong>Valid Cities:</strong> {pincodeSuggestions.districts.join(", ")}</p>
              )}
              {pincodeSuggestions.states && (
                <p><strong>Valid States:</strong> {pincodeSuggestions.states.join(", ")}</p>
              )}
              {pincodeSuggestions.cities && (
                <p><strong>Available Cities:</strong> {pincodeSuggestions.cities.join(", ")}</p>
              )}
              {pincodeSuggestions.validPincodes && (
                <p><strong>Valid Pincodes:</strong> {pincodeSuggestions.validPincodes.join(", ")}</p>
              )}
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