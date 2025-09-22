
import prisma from '../prismaClient.js';
import { slugify } from '../utils/slugify.js';

// Middleware to check for duplicate movie before file upload
export default async function checkDuplicateMovie(req, res, next) {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
    }
    const slug = slugify(title);
    const exists = await prisma.movie.findFirst({ where: { OR: [{ title }, { slug }] } });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Movie title and slug must be unique.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
