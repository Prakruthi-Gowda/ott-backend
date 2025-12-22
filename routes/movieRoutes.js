import express from 'express';
import movieController from '../controllers/movieController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Admin routes
router.post(
  '/',
  adminMiddleware,
  upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'trailer', maxCount: 1 },
    { name: 'movie', maxCount: 1 }
  ]),
  movieController.addMovie
);

router.put(
  '/:id',
  adminMiddleware,
  upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'trailer', maxCount: 1 },
    { name: 'movie', maxCount: 1 }
  ]),
  movieController.update
);

router.delete('/:id', adminMiddleware, movieController.delete);

// Public routes
router.get('/', movieController.getAll); // Remove adminMiddleware for public access
router.get('/:id', movieController.getById); // Can also be public
// router.get("/movies/:slug", movieController.getBySlug);
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  const movie = await prisma.movie.findUnique({
    where: { slug },
  });

  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  res.json(movie);
});
export default router;
