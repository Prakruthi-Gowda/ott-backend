// import express from 'express';
// import categoryController from '../controllers/categoryController.js';
// import adminMiddleware from '../middleware/adminMiddleware.js';

// const router = express.Router();

// router.post('/', adminMiddleware ,categoryController.create);
// router.get('/', adminMiddleware, categoryController.getAll);
// router.get('/:id', categoryController.getById);
// router.put('/:id', categoryController.update);
// router.delete('/:id', categoryController.delete);

// export default router;
// routes/categoryRoutes.js
import express from 'express';
import categoryController from '../controllers/categoryController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// PUBLIC ROUTES – anyone can fetch categories
router.get('/', categoryController.getAll); // no auth middleware
router.get('/:id', categoryController.getById); // no auth middleware

// ADMIN ROUTES – protected
router.post('/', adminMiddleware, categoryController.create);
router.put('/:id', adminMiddleware, categoryController.update);
router.delete('/:id', adminMiddleware, categoryController.delete);

export default router;
