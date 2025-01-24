import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const token = req.headers?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized. Please login again.",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = decoded.id;
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
        res.status(401).json({
            success: false,
            message: "Invalid token or token expired.",
        });
    }
};

export default authMiddleware;
