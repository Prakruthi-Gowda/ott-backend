import express from 'express';
import { getUserSubscription, updateUserSubscription } from '../controllers/subscriptionController.js';

const router = express.Router();

// Get subscription by userId
router.get('/:userId', getUserSubscription);

// Update latest subscription for user
router.put('/update/:userId', updateUserSubscription);

export default router;
