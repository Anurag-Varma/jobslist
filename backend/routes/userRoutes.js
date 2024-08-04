import express from "express";
import { signup, login, logout, updateJobDetails } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/updateJobDetails", protectRoute, updateJobDetails)

export default router;