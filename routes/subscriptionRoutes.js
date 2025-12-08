import express from "express";
import {
  getUserSubscription,
  updateUserSubscription
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Get subscription by userId (your existing route)
router.get("/:userId", getUserSubscription);

// NEW — Update subscription after payment success
router.post("/update", updateUserSubscription);

export default router;
