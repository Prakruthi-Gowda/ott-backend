import express from 'express';
import { userController } from '../controllers/userController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Protected route to get users
router.get('/:id', verifyToken, userController.getUsers);

export default router;
