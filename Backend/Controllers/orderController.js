import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js"; // Add this import
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

    // Validate required fields
    if (!userId || !items || !amount || !address || !userEmail) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Fetch food items to get complete details
    const foodItems = await foodModel.find({ 
      _id: { $in: items.map(item => item._id) } 
    });

    // Map items with complete details
    const completeItems = items.map(item => {
      const foodItem = foodItems.find(f => f._id.toString() === item._id);
      return {
        _id: foodItem._id,
        name: foodItem.name,
        price: foodItem.price,
        image: foodItem.image, // Include the image
        quantity: item.quantity
      };
    });

    // Create order in database
    const newOrder = await orderModel.create({
      userId,
      items: completeItems,
      amount,
      address,
      userEmail,
      status: "Food Processing",
    });

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Create Razorpay order
    const options = {
      amount: amount, // Amount in paise
      currency: "INR",
      receipt: newOrder._id.toString(),
      payment_capture: 1 // Auto-capture payment
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({ 
      success: true, 
      order: razorpayOrder, 
      orderId: newOrder._id,
      key: process.env.RAZORPAY_PUBLIC_KEY // Send Razorpay key to frontend
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error placing order",
      error: error.message 
    });
  }
};

// Verify Payment
const verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Create SHA256 signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_PRIVATE_KEY)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      // Payment verification failed
      await orderModel.findByIdAndDelete(orderId);
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Payment successful
    await orderModel.findByIdAndUpdate(orderId, { 
      status: "Food Processing", 
      payment: true,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    // Fetch order details for email
    const order = await orderModel.findById(orderId).populate('userId');
    if (order && order.userId) {
      // Send confirmation emails (user and admin)
      await sendConfirmationEmails(order);
    }

    res.status(200).json({ success: true, message: "Payment verified" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error verifying payment",
      error: error.message 
    });
  }
};

async function sendConfirmationEmails(order) {
  const userEmail = order.userId.email;
  const adminEmail = process.env.ADMIN_EMAIL;

  // User email
  const userSubject = 'Your Order Confirmation';
  const userHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4CAF50;">Thank you for your order!</h2>
      <p>Your order has been successfully placed. Below are the details:</p>
      <h3>Order Summary</h3>
      <ul>
        <li><strong>Order ID:</strong> ${order._id}</li>
        <li><strong>Items:</strong></li>
        <ul>
          ${order.items.map(item => `
            <li>
              <img src="${item.image}" alt="${item.name}" width="50" style="vertical-align: middle; margin-right: 10px;">
              ${item.name} - ₹${item.price} x ${item.quantity}
            </li>
          `).join('')}
        </ul>
        <li><strong>Total Amount:</strong> ₹${order.amount / 100}</li>
      </ul>
      <p>We will notify you once your order is out for delivery.</p>
    </div>
  `;

  await sendEmail(userEmail, userSubject, null, userHtml);

  // Admin email
  const adminSubject = 'New Order Placed';
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4CAF50;">New Order Notification</h2>
      <p>Order ID: ${order._id}</p>
      <p>Customer: ${order.userId.name} (${userEmail})</p>
      <h3>Order Details:</h3>
      <ul>
        ${order.items.map(item => `
          <li>
            <img src="${item.image}" alt="${item.name}" width="50" style="vertical-align: middle; margin-right: 10px;">
            ${item.name} - ₹${item.price} x ${item.quantity}
          </li>
        `).join('')}
      </ul>
      <p><strong>Total:</strong> ₹${order.amount / 100}</p>
      <p><strong>Delivery Address:</strong></p>
      <p>
        ${order.address.street},<br>
        ${order.address.city}, ${order.address.state}<br>
        ${order.address.ZipCode}
      </p>
    </div>
  `;

  await sendEmail(adminEmail, adminSubject, null, adminHtml);
}

// ... rest of the controller methods remain the same ...


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

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  handleWebhookEvent,
  deleteOrder
};