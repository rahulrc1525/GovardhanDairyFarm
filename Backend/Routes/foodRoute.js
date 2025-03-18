import express from "express";
import { addFood, listFood, removeFood, updateFood, updateClicks, getRecommendedFood, upload } from "../Controllers/foodController.js";

const foodRouter = express.Router();

// Routes
foodRouter.post("/add", upload.single("image"), addFood); // Use multer for file uploads
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/update", updateFood);
foodRouter.post("/updateclicks", updateClicks);
foodRouter.get("/recommended", getRecommendedFood);

export default foodRouter;