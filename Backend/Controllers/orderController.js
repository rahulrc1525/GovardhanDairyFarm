import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Razorpay with updated environment variable names
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_PUBLIC_KEY || "your_fallback_key",
    key_secret: process.env.RAZORPAY_PRIVATE_KEY || "your_fallback_secret"
});

// Placing user order from frontend
const placeOrder = async (req, res) => {
    const frontend_url = "https://govardhandairyfarm.onrender.com/";

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            status: "Pending"
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Create Razorpay order
        const options = {
            amount: req.body.amount * 100, // Amount in paisa
            currency: "INR",
            receipt: newOrder._id.toString(),
            payment_capture: 1
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({ success: true, order: razorpayOrder, orderId: newOrder._id });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error placing order" });
    }
};

// Verify payment from Razorpay webhook
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_PRIVATE_KEY)
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            await orderModel.findByIdAndUpdate(orderId, { status: "Paid" });
            res.json({ success: true, message: "Payment verified" });
        } else {
            res.json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error verifying payment" });
    }
};

export { placeOrder, verifyPayment };
