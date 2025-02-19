import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { Infobip, AuthType } from '@infobip-api/sdk';

dotenv.config();


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_PUBLIC_KEY,
  key_secret: process.env.RAZORPAY_PRIVATE_KEY,
});

// Place Order
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Create new order in the database
    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      address,
      status: "Food Processing"
    });

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Create Razorpay order
    const options = {
      amount: amount, // Amount is already in paise
      currency: "INR",
      receipt: newOrder._id.toString(),
    };
    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({ success: true, order: razorpayOrder, orderId: newOrder._id });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};

// Verify Payment
// Verify Payment
const verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_PRIVATE_KEY)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await orderModel.findByIdAndUpdate(orderId, { status: "Food Processing", payment: true });
      console.log(`Order ${orderId} status updated to Food Processing`);

      // Fetch order details
      const order = await orderModel.findById(orderId);
      if (order) {
        console.log(`Sending SMS to ${order.address.phone}`);

        try {
          const smsResponse = await infobip.channels.sms.send({
            messages: [{
              destinations: [{ to: `+91${order.address.phone}` }], // Ensure international format
              text: `Thank you for your order! Your order will be delivered in 2 to 5 days. Order ID: ${orderId}`,
              from: 'GovardhanDairyFarm', // Your sender ID
            }]
          });

          console.log('SMS Response:', smsResponse);
        } catch (error) {
          console.error('Error sending SMS:', error.response?.data || error.message);
        }
      } else {
        console.error('Order not found:', orderId);
      }

      return res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      await orderModel.findByIdAndDelete(orderId); // Delete order if payment fails
      console.log(`Order ${orderId} deleted due to payment verification failure`);
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
    const orders = await orderModel.find({ userId: req.body.userId, payment: true }); // Only fetch orders with payment true
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Get all orders (Admin only)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ payment: true }); // Only fetch orders with payment true
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

const infobip = new Infobip({
  baseUrl: 'qdvymq.api.infobip.com', // e.g., 'https://api.infobip.com'
  apiKey: '814b5c981a948eaf1e9b9e01713aba48-df3a633b-fe28-424c-94a6-81dbc99229ed',
  authType: AuthType.ApiKey,
});


export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus }; 