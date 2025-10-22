import prisma from '../prismaClient.js';

export const createSubscriptionWithPayment = async (req, res) => {
  const { userId, plan, price, razorpayPaymentId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create subscription
      const subscription = await tx.subscription.create({
        data: {
         userId: user?.id,
          plan,
          price,
          status: 'ACTIVE',
          currency: 'INR',
        },
      });

      // 2️⃣ Create payment linked to subscription
      const payment = await tx.payment.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          amount: price,
          currency: 'INR',
          status: 'PAID',
          razorpayPaymentId,
        },
      });

      return { subscription, payment };
    });

    res.status(201).json({
      message: 'Subscription and payment created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    res.status(500).json({ error: 'Transaction failed', details: error.message });
  }
};
