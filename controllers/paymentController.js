import Stripe from "stripe";
import prisma from "../prismaClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =======================
// CREATE PAYMENT INTENT
// =======================
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "usd" } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating payment intent" });
  }
};

// =======================
// VERIFY PAYMENT
// =======================
export const verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId, userId, plan, price } = req.body;

    if (!paymentIntentId || !userId)
      return res.status(400).json({ message: "Missing fields" });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          userId,
          plan,
          price,
          status: "ACTIVE",
          currency: paymentIntent.currency.toUpperCase(),
        },
      });

      await tx.payment.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: "PAID",
          stripePaymentId: paymentIntent.id,
          notes: paymentIntent,
        },
      });

      return subscription;
    });

    res.json({ success: true, data: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};
