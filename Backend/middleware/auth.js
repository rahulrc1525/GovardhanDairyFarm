import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        // Get the Authorization header
        const authHeader = req.headers.authorization;

        // Check if token exists and is in the correct format
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login again.",
            });
        }

        // Extract the token from the "Bearer <token>" format
        const token = authHeader.split(" ")[1];

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach userId to request body for further use
        req.body.userId = decoded.id;

        // Move to the next middleware or controller
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please login again.",
                expiredAt: error.expiredAt,
            });
        }

        console.error("Error in token verification:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid token or token expired.",
        });
    }
};

export default authMiddleware;
