import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MongoDB connection URI not found in environment variables.");
        }

        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("DB Connected successfully.");
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
        process.exit(1);
    }
};
