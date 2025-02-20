import React, { useEffect, useContext } from "react";
import "./Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "./../../context/StoreContext";
import axios from "axios";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const razorpay_order_id = searchParams.get("razorpay_order_id");
  const razorpay_payment_id = searchParams.get("razorpay_payment_id");
  const razorpay_signature = searchParams.get("razorpay_signature");
  const orderId = searchParams.get("orderId");

  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const verifyPayment = async () => {
    try {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
        console.error("Invalid payment details");
        alert("Payment verification failed. Redirecting to home...");
        navigate("/");
        return;
      }
  
      const response = await axios.post(`${url}/api/order/verify`, {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
      });
  
      if (response.data.success) {
        alert("Payment verified successfully!");
        navigate("/myorders");
      } else {
        alert("Payment verification failed.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error during payment verification:", error.response?.data || error.message);
      alert("Error verifying payment.");
      navigate("/");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>Verifying Payment, please wait...</p>
    </div>
  );
};

export default Verify; 