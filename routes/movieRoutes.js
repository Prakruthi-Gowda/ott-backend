import express from 'express';
import movieController from '../controllers/movieController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Create movie (admin only, with file upload)
router.post('/', adminMiddleware, upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'trailer', maxCount: 1 },
  { name: 'movie', maxCount: 1 }
]), movieController.addMovie);
// Get all movies
router.get('/', movieController.getAll);
// Get movie by id
router.get('/:id', movieController.getById);
// Update movie (admin only, with file upload)
router.put('/:id', adminMiddleware, upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'trailer', maxCount: 1 },
  { name: 'movie', maxCount: 1 }
]), movieController.update);
// Delete movie (admin only)
router.delete('/:id', adminMiddleware, movieController.delete);

export default router;
