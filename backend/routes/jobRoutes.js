import express from "express";
import { getJobs, addJob, getJob, deleteJob } from "../controllers/jobController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, getJobs)
router.get("/:jobId", protectRoute, getJob)
router.post("/addJob", addJob) //need to add verification and only admin can add the jobs
router.post("/deleteJob", protectRoute, deleteJob)
export default router;