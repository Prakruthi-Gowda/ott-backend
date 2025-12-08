import Stripe from "stripe";
import prisma from "../prismaClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================
// CREATE CHECKOUT SESSION
// ============================
export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, planName, userId, currency = "usd", success_url, cancel_url } = req.body;

    if (!amount || !planName || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("[Stripe] Creating checkout session:", { amount, planName, userId });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: planName },
            unit_amount: Math.round(amount * 100), // amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: { userId, planName, amount },
      success_url: success_url || `${process.env.NEXT_PUBLIC_CLIENT_URL}/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_CLIENT_URL}/payment?success=false`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe] createCheckoutSession error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ============================
// VERIFY CHECKOUT SESSION
// ============================
export const verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) return res.status(404).json({ message: "Stripe session not found" });
    if (session.payment_status !== "paid") return res.status(400).json({ message: "Payment not completed" });

    const { userId, planName, amount } = session.metadata;

    if (!userId || !planName || !amount) return res.status(400).json({ message: "Invalid session metadata" });

    const amountNumber = Number(amount);

    // Transaction: create or update subscription and log payment
    const subscription = await prisma.$transaction(async (tx) => {
      let sub = await tx.subscription.findFirst({ where: { userId, plan: planName } });

      if (sub) {
        sub = await tx.subscription.update({
          where: { id: sub.id },
          data: { price: amountNumber, status: "ACTIVE", currency: session.currency.toUpperCase() },
        });
      } else {
        sub = await tx.subscription.create({
          data: { userId, plan: planName, price: amountNumber, status: "ACTIVE", currency: session.currency.toUpperCase() },
        });
      }

      await tx.payment.create({
        data: {
          userId,
          subscriptionId: sub.id,
          amount: amountNumber,
          currency: session.currency.toUpperCase(),
          status: "PAID",
          stripePaymentId: session.id,
          notes: JSON.stringify(session),
        },
      });

      return sub;
    });

    return res.json({ success: true, data: subscription });
  } catch (error) {
    console.error("[Stripe] verifyCheckoutSession error:", error);
    return res.status(500).json({ message: error.message || "Error verifying checkout session" });
  }
};
