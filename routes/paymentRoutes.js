import express from "express";
import { createCheckoutSession, verifyCheckoutSession } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/verify-checkout-session", verifyCheckoutSession);

export default router;
