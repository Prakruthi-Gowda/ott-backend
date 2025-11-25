// import express from "express";
// import { createOrder, verifyPayment } from "../controllers/paymentController.js";

// const router = express.Router();

// router.post("/create-order", createOrder);
// router.post("/verify-payment", verifyPayment);

// export default router;


import express from "express";
import { createPaymentIntent, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.post("/verify-payment", verifyPayment);

export default router;

