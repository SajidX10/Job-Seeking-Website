import express from "express";
import {
  deleteJob,
  getAllJobs,
  getMyJobs,
  getSingleJob,
  postJob,
  updateJob,
} from "../controllers/jobController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { recommendJobs } from '../controllers/recommendationController.js'; // Only import recommendJobs

const router = express.Router();

// Existing routes...
router.get("/getall", getAllJobs);
router.post("/post", isAuthenticated, postJob);
router.get("/getmyjobs", isAuthenticated, getMyJobs);
router.put("/update/:id", isAuthenticated, updateJob);
router.delete("/delete/:id", isAuthenticated, deleteJob);
router.get("/:id", isAuthenticated, getSingleJob);

// New route for job recommendations
router.get('/recommendations', isAuthenticated, async (req, res) => {
    try {
        const { filterBy, sortBy } = req.query;
        const recommendedJobs = await recommendJobs(req.user.id, filterBy, sortBy);
        res.json(recommendedJobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
});

export default router;