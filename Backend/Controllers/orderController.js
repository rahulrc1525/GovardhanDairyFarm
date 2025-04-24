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
    const { userId, items, amount, address, userEmail } = req.body;

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
      userEmail,
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
      await orderModel.findByIdAndUpdate(orderId, { status: "Food Processing", payment: true });
      
      const order = await orderModel.findById(orderId);
      if (order) {
        const userEmail = order.userEmail;
        const adminEmail = process.env.ADMIN_EMAIL;

        // User email template
        const userSubject = 'Order Confirmation - Govardhan Dairy Farm';
        const userHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4CAF50;">Thank you for your order!</h2>
            <p>Your order (#${orderId}) has been successfully placed.</p>
            <h3>Order Details</h3>
            <ul>
              ${order.items.map(item => `
                <li>${item.name} - ₹${item.price} x ${item.quantity}</li>
              `).join('')}
            </ul>
            <p><strong>Total Amount:</strong> ₹${order.amount / 100}</p>
            <p><strong>Delivery Address:</strong><br>
            ${Object.values(order.address).join(', ')}</p>
            <p>We'll notify you when your order status updates.</p>
          </div>
        `;

        // Admin email template
        const adminSubject = `New Order #${orderId} Received`;
        const adminHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4CAF50;">New Order Notification</h2>
            <p>Customer: ${userEmail}</p>
            <h3>Order Details</h3>
            <ul>
              ${order.items.map(item => `
                <li>${item.name} - ₹${item.price} x ${item.quantity}</li>
              `).join('')}
            </ul>
            <p><strong>Total Amount:</strong> ₹${order.amount / 100}</p>
          </div>
        `;

        // Send emails
        await Promise.all([
          sendEmail(userEmail, userSubject, null, userHtml),
          sendEmail(adminEmail, adminSubject, null, adminHtml)
        ]);
      }

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

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const subject = `Order #${orderId} Status Update`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Order Status Updated</h2>
        <p>Your order status has been updated to: <strong>${status}</strong></p>
        <h3>Order Summary</h3>
        <ul>
          ${updatedOrder.items.map(item => `
            <li>${item.name} - ₹${item.price} x ${item.quantity}</li>
          `).join('')}
        </ul>
        <p><strong>Total Amount:</strong> ₹${updatedOrder.amount / 100}</p>
        <p>Thank you for choosing Govardhan Dairy Farm!</p>
      </div>
    `;

    await sendEmail(updatedOrder.userEmail, subject, null, html);

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