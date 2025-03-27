import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { sendEmail } from "./emailService.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_PUBLIC_KEY,
  key_secret: process.env.RAZORPAY_PRIVATE_KEY,
});

// Place Order
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, userEmail } = req.body;

    console.log("Request Body:", req.body); // Debugging: Log request body

    // Validate required fields
    if (!userId || !items || !amount || !address || !userEmail) {
      console.error("Missing required fields in request body");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Create new order in the database
    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      address,
      userEmail, // Include userEmail in the order
      status: "Food Processing", // Set initial status to "Food Processing"
      
    });

    console.log("New Order Created:", newOrder); // Debugging: Log created order

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Create Razorpay order
    const options = {
      amount: amount, // Amount is already in paise
      currency: "INR",
      receipt: newOrder._id.toString(),
    };
    const razorpayOrder = await razorpay.orders.create(options);

    console.log("Razorpay Order Created:", razorpayOrder); // Debugging: Log Razorpay order

    res.status(201).json({ success: true, order: razorpayOrder, orderId: newOrder._id });
  } catch (error) {
    console.error("Error placing order:", error); // Debugging: Log any errors
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};

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
      // Payment successful, update order status and set payment to true
      await orderModel.findByIdAndUpdate(orderId, { status: "Food Processing", payment: true });
      console.log(`Order ${orderId} status updated to Food Processing`);

      // Fetch order details
      const order = await orderModel.findById(orderId).populate('userId');
      if (order && order.userId) {
        const userEmail = order.userId.email; // User's email from the order
        const adminEmail = process.env.ADMIN_EMAIL; // Admin email from .env

        // Prepare email content for the user
        const userSubject = 'Your Order Confirmation';
        const userText = `Thank you for your order! Your order ID is ${orderId}.`;
        const userHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4CAF50;">Thank you for your order!</h2>
            <p>Your order has been successfully placed. Below are the details:</p>
            <h3>Order Summary</h3>
            <ul>
              <li><strong>Order ID:</strong> ${orderId}</li>
              <li><strong>Items:</strong></li>
              <ul>
                ${order.items.map(item => `
                  <li>${item.name} - ₹${item.price} x ${item.quantity}</li>
                `).join('')}
              </ul>
              <li><strong>Total Amount:</strong> ₹${order.amount / 100}</li>
              <li><strong>Delivery Address:</strong></li>
              <ul>
                <li>${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.ZipCode}</li>
              </ul>
            </ul>
            <p>We will notify you once your order is out for delivery.</p>
            <p>Thank you for shopping with us!</p>
            <p>Best regards,<br/>Govardhan Dairy Farm</p>
          </div>
        `;

        // Send email to the user
        await sendEmail(userEmail, userSubject, userText, userHtml);

        // Prepare email content for the admin
        const adminSubject = 'New Order Placed';
        const adminText = `A new order has been placed. Order ID: ${orderId}, User Email: ${userEmail}`;
        const adminHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4CAF50;">New Order Placed</h2>
            <p>A new order has been placed. Below are the details:</p>
            <h3>Order Summary</h3>
            <ul>
              <li><strong>Order ID:</strong> ${orderId}</li>
              <li><strong>User Email:</strong> ${userEmail}</li>
              <li><strong>Items:</strong></li>
              <ul>
                ${order.items.map(item => `
                  <li>${item.name} - ₹${item.price} x ${item.quantity}</li>
                `).join('')}
              </ul>
              <li><strong>Total Amount:</strong> ₹${order.amount / 100}</li>
              <li><strong>Delivery Address:</strong></li>
              <ul>
                <li>${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.ZipCode}</li>
              </ul>
            </ul>
            <p>Please process the order as soon as possible.</p>
            <p>Best regards,<br/>Govardhan Dairy Farm</p>
          </div>
        `;

        // Send email to the admin
        await sendEmail(adminEmail, adminSubject, adminText, adminHtml);
      }

      return res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      // Payment failed, delete the order
      await orderModel.findByIdAndDelete(orderId);
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

    // Update the order status
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return the updated order
    ).populate('userId');

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Send email to the user if the status is "Out for Delivery" or "Delivered"
    if (status === "Out for delivery" || status === "Delivered") {
      const userEmail = updatedOrder.userId.email; // User's email from the order

      // Prepare email content
      const subject = `Your Order Status Update`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Order Status Updated</h2>
          <p>Your order status has been updated to <strong>${status}</strong>. Below are the details:</p>
          <h3>Order Summary</h3>
          <ul>
            <li><strong>Order ID:</strong> ${updatedOrder._id}</li>
            <li><strong>Status:</strong> ${status}</li>
            <li><strong>Items:</strong></li>
            <ul>
              ${updatedOrder.items.map(item => `
                <li>${item.name} - ₹${item.price} x ${item.quantity}</li>
              `).join('')}
            </ul>
            <li><strong>Total Amount:</strong> ₹${updatedOrder.amount / 100}</li>
            <li><strong>Delivery Address:</strong></li>
            <ul>
              <li>${updatedOrder.address.street}, ${updatedOrder.address.city}, ${updatedOrder.address.state}, ${updatedOrder.address.ZipCode}</li>
            </ul>
          </ul>
          <p>Thank you for shopping with us!</p>
          <p>Best regards,<br/>Govardhan Dairy Farm</p>
        </div>
      `;

      // Send email to the user
      await sendEmail(userEmail, subject, null, html);
    }

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
// Delete Order
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    await orderModel.findByIdAndDelete(orderId);
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Error deleting order" });
  }
};


export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, handleWebhookEvent, deleteOrder };