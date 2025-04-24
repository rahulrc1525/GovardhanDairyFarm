import express from "express";
import { addFood, listFood, removeFood, updateFood,  getRecommendedFood } from "../Controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router();

const storage = multer.diskStorage({
  destination: "Uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/update", updateFood); // New route for updating food
//foodRouter.post("/updateclicks", updateClicks);
foodRouter.get("/recommended", getRecommendedFood);

export default foodRouter;