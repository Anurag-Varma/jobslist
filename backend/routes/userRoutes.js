import express from "express";
import { signup, login, logout, updateJobDetails, updateUser, referralEmail } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/updateJobDetails", protectRoute, updateJobDetails)
router.put('/update', protectRoute, updateUser)
router.get("/referralEmail", protectRoute, referralEmail)


export default router;