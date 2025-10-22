// routes/subscriptionRoutes.js
import express from "express";
import { createSubscriptionWithPayment } from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/create-subscription", createSubscriptionWithPayment);

export default router;
