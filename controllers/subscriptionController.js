import prisma from "../prismaClient.js";

// GET: Get user's latest active subscription
export const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: { userId: Number(userId), status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { payments: true },
    });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    res.json(subscription);
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const updateUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planName, amount, currency, stripePaymentId } = req.body;

    if (!planName || amount == null) {
      return res.status(400).json({ message: "Missing required fields: planName, amount" });
    }

    const price = Number(amount);

    // Find any latest ACTIVE subscription
    let subscription = await prisma.subscription.findFirst({
      where: { userId: Number(userId), status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    // ✔ If no active subscription exists → Create new subscription
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: Number(userId),
          plan: planName,
          price,
          currency: currency || "INR",
          status: "ACTIVE",
          startsAt: new Date(),
        },
      });
    } else {
      // ✔ If active subscription exists → Update it
      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          plan: planName,
          price,
          currency: currency || subscription.currency,
          updatedAt: new Date(),
        },
      });
    }

    // Add payment record for tracking
    await prisma.payment.create({
      data: {
        userId: Number(userId),
        subscriptionId: subscription.id,
        amount: price,
        currency: currency || "INR",
        status: "SUCCESS",
        stripePaymentId: stripePaymentId || null,
        notes: { method: "Stripe" },
      },
    });

    res.json({
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
