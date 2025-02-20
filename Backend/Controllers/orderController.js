import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_PUBLIC_KEY,
  key_secret: process.env.RAZORPAY_PRIVATE_KEY,
});

// Place Order
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Create Razorpay order (do not save to database yet)
    const options = {
      amount: amount, // Amount is already in paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`, // Temporary receipt ID
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Return Razorpay order details to the frontend
    res.status(201).json({
      success: true,
      order: razorpayOrder,
      orderData: { userId, items, amount, address }, // Pass order data to frontend
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};

// Verify Payment
const verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_PRIVATE_KEY)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment successful, create the order in the database
      const newOrder = await orderModel.create({
        userId: orderData.userId,
        items: orderData.items,
        amount: orderData.amount,
        address: orderData.address,
        status: "Food Processing",
        payment: true,
      });

      // Clear user's cart
      await userModel.findByIdAndUpdate(orderData.userId, { cartData: {} });

      console.log(`Order ${newOrder._id} created successfully`);
      return res.status(200).json({ success: true, message: "Payment verified", orderId: newOrder._id });
    } else {
      // Payment failed, do not create the order
      console.log("Payment verification failed");
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};
// Get orders of a user
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId, status: { $ne: "Cancelled" } });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Get all orders (Admin only)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ status: { $ne: "Cancelled" } });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, message: "Error fetching all orders" });
  }
};


// Update order status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.status(200).json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

// Handle webhook events
const handleWebhookEvent = async (req, res) => {
  try {
    const event = req.body;
    if (event.event === "payment.failed" || event.event === "payment.cancelled") {
      const orderId = event.payload.payment.entity.order_id;
      await orderModel.findByIdAndDelete(orderId); // Delete order if payment fails or is cancelled
      console.log(`Order ${orderId} deleted due to payment failure or cancellation`);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    res.status(500).json({ success: false });
  }
};


export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, handleWebhookEvent };