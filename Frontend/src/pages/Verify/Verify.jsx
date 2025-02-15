import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Verify = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extracting parameters from URL
  const razorpay_payment_id = searchParams.get("razorpay_payment_id");
  const razorpay_order_id = searchParams.get("razorpay_order_id");
  const razorpay_signature = searchParams.get("razorpay_signature");
  const orderId = searchParams.get("orderId");
  
  useEffect(() => {
    const verifyPayment = async () => {
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
        toast.error("Invalid payment details.");
        navigate("/");
        return;
      }

      try {
        const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/order/verify`, {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderId,
        });

        if (data.success) {
          toast.success("Payment verified successfully!");
          navigate("/myorders");
        } else {
          throw new Error("Verification failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error("Payment verification failed. Please contact support.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [navigate, razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId]);

  return (
    <div className="flex justify-center items-center h-screen">
      {loading ? (
        <p className="text-lg font-semibold">Verifying Payment...</p>
      ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )}
    </div>
  );
};

export default Verify;
