import express from "express";
import { getJobs, addJob, getJob, deleteJob, getJobIds, updateJob } from "../controllers/jobController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, getJobs)
router.get("/getJobIds", protectRoute, getJobIds)
router.get("/:jobId", protectRoute, getJob)
router.post("/addJob", protectRoute, addJob)
router.post("/deleteJob", protectRoute, deleteJob)
router.put("/updateJob", protectRoute, updateJob)

export default router;