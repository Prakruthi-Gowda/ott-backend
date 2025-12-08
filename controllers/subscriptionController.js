import prisma from '../prismaClient.js';

// Get user's subscription
export const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: { userId: Number(userId), status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { payment: true },
    });

    if (!subscription) {
      return res.status(404).json({ message: "No subscription found" });
    }

    res.json(subscription);

  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const updateUserSubscription = async (req, res) => {
  try {
    const { userId, planName, amount } = req.body;

    if (!userId || !planName || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId: Number(userId) },
      update: {
        planName,
        price: amount,
        status: "ACTIVE",
        updatedAt: new Date(),
      },
      create: {
        userId: Number(userId),
        planName,
        price: amount,
        status: "ACTIVE",
      },
    });

    await prisma.payment.create({
      data: {
        userId: Number(userId),
        subscriptionId: subscription.id,
        amount,
        status: "SUCCESS",
        method: "Stripe",
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
