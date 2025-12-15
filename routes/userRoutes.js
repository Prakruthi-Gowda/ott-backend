import express from 'express';
import { userController } from '../controllers/userController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// ADMIN → Get all users
router.get('/', verifyToken, userController.getUsers);

// USER → Update profile by ID
router.put('/update/:id', verifyToken, userController.updateProfile);

export default router;
