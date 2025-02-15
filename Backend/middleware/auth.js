import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js"; 

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Received Authorization Header:", authHeader); // Check if token is received

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided. Please login." });
    }

    try {
        const token = authHeader.split(" ")[1];
        console.log("Extracted Token:", token); // Verify token is extracted
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Check decoded data

        const user = await userModel.findById(decoded.id).select("-password");
        console.log("Authenticated User:", user); // Ensure user is found

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found. Please login again." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Token Verification Error:", error);
        return res.status(401).json({ success: false, message: "Invalid or expired token. Please login again." });
    }
};




export default authMiddleware;
