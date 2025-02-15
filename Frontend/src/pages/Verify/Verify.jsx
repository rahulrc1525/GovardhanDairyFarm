import React, { useEffect, useContext, useState } from 'react';
import "./Verify.css";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from './../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Verify = () => {
const [searchParams] = useSearchParams();
const razorpay_order_id = searchParams.get("razorpay_order_id");
const razorpay_payment_id = searchParams.get("razorpay_payment_id");
const razorpay_signature = searchParams.get("razorpay_signature");
const orderId = searchParams.get("orderId");

const { url } = useContext(StoreContext);
const navigate = useNavigate();
const [loading, setLoading] = useState(true);

const verifyPayment = async () => {
if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
toast.error("Invalid payment details. Redirecting to home...");
navigate("/");
return;
}

try {
const response = await axios.post(`${url}/api/order/verify`, {
razorpay_order_id,
razorpay_payment_id,
razorpay_signature,
orderId,
});

if (response.data.success) {
toast.success("Payment verified successfully!");
navigate("/myorders");
} else {
toast.error("Payment verification failed. Please try again.");
navigate("/");
}
} catch (error) {
console.error("Error during payment verification:", error);
toast.error("Error verifying payment. Please try again.");
navigate("/");
} finally {
setLoading(false);
}
};

useEffect(() => {
if (razorpay_order_id && razorpay_payment_id && razorpay_signature && orderId) {
verifyPayment();
} else {
setLoading(false);
toast.error("Missing payment details. Redirecting...");
navigate("/");
}
}, []);

return (
<div className='verify'>
{loading ? (
<>
<div className="spinner"></div>
<p>Verifying Payment, please wait...</p>
</>
) : (
<p>Redirecting...</p>
)}
</div>
);
};

export default Verify;