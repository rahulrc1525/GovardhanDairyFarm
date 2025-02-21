import express from "express";
import { getSalesAnalysis } from "../Controllers/salesController.js";

const salesRouter = express.Router();

salesRouter.get("/analysis", getSalesAnalysis);

export default salesRouter;