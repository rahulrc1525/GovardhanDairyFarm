import express from "express";
import { getSalesAnalysis } from "../Controllers/salesController.js";
import authMiddleware from "../middleware/auth.js";

const salesRouter = express.Router();

salesRouter.get("/analysis", authMiddleware, getSalesAnalysis);

export default salesRouter;