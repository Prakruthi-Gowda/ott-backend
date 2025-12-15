import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const userController = {

  // ADMIN: Get all users
  getUsers: async (req, res) => {
    try {
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

      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // USER: Update profile using userId from request
  updateProfile: async (req, res) => {
  try {
    const userId = req.params.id; // ✅ from URL
    const { name, email, phone, password } = req.body;

    // Optional: allow only self-update
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

};
