import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import { sendEmail } from "./emailService.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_PUBLIC_KEY,
  key_secret: process.env.RAZORPAY_PRIVATE_KEY,
});

// Place Order
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Get user details to ensure we have the email
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Create items array with full image URLs
    const orderItems = await Promise.all(items.map(async (item) => {
      const foodItem = await foodModel.findById(item._id);
      let imageUrl = foodItem.image;
      
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = `${process.env.BASE_URL}/uploads/${imageUrl}`;
      }

      return {
        _id: item._id,
        name: item.name || foodItem.name,
        price: item.price || foodItem.price,
        quantity: item.quantity,
        image: imageUrl
      };
    }));

    const newOrder = await orderModel.create({
      userId,
      items: orderItems,
      amount,
      address,
      userEmail: user.email, // Store user email from user document
      status: "Food Processing",
    });

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const options = {
      amount: amount,
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
const verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_PRIVATE_KEY)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId, 
        { status: "Food Processing", payment: true },
        { new: true }
      ).populate('userId');

      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // Send email to user
      const userSubject = 'Your Order Confirmation';
      const userHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Thank you for your order!</h2>
          <p>Your order has been successfully placed. Below are the details:</p>
          <h3>Order Summary</h3>
          <ul>
            <li><strong>Order ID:</strong> ${orderId}</li>
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
          <p>We will notify you once your order is out for delivery.</p>
          <p>Thank you for shopping with us!</p>
        </div>
      `;

      await sendEmail(updatedOrder.userEmail, userSubject, null, userHtml);

      // Send email to admin
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminSubject = 'New Order Placed';
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">New Order Placed</h2>
          <p>A new order has been placed. Below are the details:</p>
          <h3>Order Summary</h3>
          <ul>
            <li><strong>Order ID:</strong> ${orderId}</li>
            <li><strong>User Email:</strong> ${updatedOrder.userEmail}</li>
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
          <p>Please process the order as soon as possible.</p>
        </div>
      `;

      await sendEmail(adminEmail, adminSubject, null, adminHtml);

      return res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

// Update order status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('userId');

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Send email for all status updates
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
        </ul>
        <p>${getStatusMessage(status)}</p>
        <p>Thank you for shopping with us!</p>
      </div>
    `;

    await sendEmail(updatedOrder.userEmail, subject, null, html);

    res.status(200).json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

// Helper function for status messages
function getStatusMessage(status) {
  switch(status) {
    case "Food Processing":
      return "Your order is being prepared. We'll notify you when it's ready for delivery.";
    case "Out for delivery":
      return "Your order is on its way! Our delivery partner will contact you shortly.";
    case "Delivered":
      return "Your order has been delivered. We hope you enjoy your purchase!";
    case "Cancelled":
      return "Your order has been cancelled. If this was unexpected, please contact our support.";
    default:
      return "We'll keep you updated on your order status.";
  }
}



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
// Handle webhook events
const handleWebhookEvent = async (req, res) => {
  try {
    const event = req.body;
    if (event.event === "payment.failed" || event.event === "payment.cancelled") {
      const orderId = event.payload.payment.entity.order_id;
      await orderModel.findByIdAndDelete(orderId);
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

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  handleWebhookEvent,
  deleteOrder
};