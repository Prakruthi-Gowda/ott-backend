import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userController = {
  getUsers: async (req, res) => {
    try {
      // Optional: restrict to admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
