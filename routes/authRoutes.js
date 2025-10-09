// import express from 'express';
// import authController from '../controllers/authController.js';

// const router = express.Router();

// router.post('/register', authController.register);
// router.post('/login', authController.login);
// router.post('/logout', authController.logout);
// export default router;
// routes/authRoutes.js
import express from 'express';
import authController, { verifyToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
// Protected: get authenticated user's subscriptions
router.get('/subscriptions', verifyToken, authController.getSubscriptions);

export default router;
