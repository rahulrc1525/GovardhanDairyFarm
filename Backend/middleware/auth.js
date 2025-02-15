import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js"; // Import user model

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from the authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login again.",
            });
        }

        // Extract token from 'Bearer <token>'
        const token = authHeader.split(" ")[1];

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists in the database
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again.",
            });
        }

        // Attach user data to the request object
        req.user = user;
        next(); // Continue to the next middleware

    } catch (error) {
        console.error("Authentication Error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please login again.",
                expiredAt: error.expiredAt,
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token or token expired.",
        });
    }
};

export default authMiddleware;
