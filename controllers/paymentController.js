// import Razorpay from "razorpay";
// import crypto from "crypto";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Create order
// export const createOrder = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (!amount) return res.status(400).json({ success: false, message: "Amount is required" });

//     const order = await razorpay.orders.create({
//       amount, // amount in paise
//       currency: "INR",
//       receipt: `receipt_order_${Date.now()}`,
//     });

//     res.status(200).json({
//       success: true,
//       id: order.id,
//       amount: order.amount,
//       currency: order.currency,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error creating order" });
//   }
// };

// // Verify payment
// export const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature === razorpay_signature) {
//       res.status(200).json({ success: true, message: "Payment verified" });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid signature" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error verifying payment" });
//   }
// };

import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../prismaClient.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Step 1 — Create Order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

// Step 2 — Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
      price,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Save in DB
    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          userId,
          plan,
          price,
          status: "ACTIVE",
          currency: "INR",
        },
      });

      const payment = await tx.payment.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          amount: price,
          currency: "INR",
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
          notes: {
            razorpay_order_id,
            razorpay_signature,
          },
        },
      });

      return { subscription, payment };
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: result,
    });
  } catch (err) {
    console.error("❌ Transaction failed:", err);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: err.message,
    });
  }
};
