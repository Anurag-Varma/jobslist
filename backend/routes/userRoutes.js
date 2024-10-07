import express from "express";
import { signup, login, logout, updateJobDetails, updateUser, referralEmail, sendEmail, oauth2callback } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/updateJobDetails", protectRoute, updateJobDetails)
router.put('/update', protectRoute, updateUser)
router.post("/referralEmail", protectRoute, referralEmail)
router.post("/send-email", protectRoute, sendEmail)
router.post("/oauth2callback", protectRoute, oauth2callback)

export default router;