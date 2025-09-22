import express from 'express';
import categoryController from '../controllers/categoryController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/', adminMiddleware ,categoryController.create);
router.get('/', adminMiddleware, categoryController.getAll);
router.get('/:id', categoryController.getById);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;
