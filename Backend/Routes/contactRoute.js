import express from "express";
import { sendContactMessage } from "../Controllers/contactusController.js";

const router = express.Router();

router.post("/", sendContactMessage);

export default router;
