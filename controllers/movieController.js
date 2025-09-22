import { PrismaClient } from '@prisma/client';
import adminMiddleware from '../middleware/adminMiddleware.js';

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

const movieController = {
  // Create movie (admin only)
  addMovie: async (req, res) => {
    const { title, genre, releaseDate, description, categoryId } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
    }

    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({ error: 'Valid categoryId is required.' });
    }

    // Handle file uploads
    const bannerFile = req.files?.banner?.[0];
    const trailerFile = req.files?.trailer?.[0];
    const movieFile = req.files?.movie?.[0];
    
    if (!bannerFile || !trailerFile || !movieFile) {
      return res.status(400).json({ error: 'Banner, trailer, and movie files are required.' });
    }

    const banner = bannerFile.path;
    const trailer = trailerFile.path;
    const movie = movieFile.path;
    const slug = slugify(title);
    
    try {
      const exists = await prisma.movie.findFirst({ where: { OR: [{ title }, { slug }] } });

      if (exists){
        return res.status(409).json({ error: 'Movie title and slug must be unique.' });
      } 

      const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
      
      if (!category){
        return res.status(404).json({ error: 'Category not found.' });
      } 

      const newMovie = await prisma.movie.create({
        data: { title, slug, genre, releaseDate: new Date(releaseDate), description, banner, trailer, movie, categoryId: Number(categoryId) },
      });
      
      res.status(201).json(newMovie);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Get all movies
  getAll: async (req, res) => {
    try {
      const movies = await prisma.movie.findMany({ include: { category: true } });
      res.json(movies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Get movie by id
  getById: async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(400).json({ error: 'Invalid movie ID.' });
    try {
      const movie = await prisma.movie.findUnique({ where: { id: Number(id) }, include: { category: true } });
      if (!movie) return res.status(404).json({ error: 'Movie not found.' });
      res.json(movie);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Update movie (admin only)
  update: async (req, res) => {
    const { id } = req.params;
    const { title, genre, releaseDate, description, categoryId } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
    }
    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({ error: 'Valid categoryId is required.' });
    }
    // Handle file uploads
    const bannerFile = req.files?.banner?.[0];
    const trailerFile = req.files?.trailer?.[0];
    const movieFile = req.files?.movie?.[0];
    const banner = bannerFile ? bannerFile.path : undefined;
    const trailer = trailerFile ? trailerFile.path : undefined;
    const movie = movieFile ? movieFile.path : undefined;
    const slug = slugify(title);
    try {
      const exists = await prisma.movie.findUnique({ where: { id: Number(id) } });
      if (!exists) return res.status(404).json({ error: 'Movie not found.' });
      const titleOrSlugExists = await prisma.movie.findFirst({ where: { OR: [{ title }, { slug }], NOT: { id: Number(id) } } });
      if (titleOrSlugExists) return res.status(409).json({ error: 'Movie title and slug must be unique.' });
      const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
      if (!category) return res.status(404).json({ error: 'Category not found.' });
      const updatedMovie = await prisma.movie.update({
        where: { id: Number(id) },
        data: {
          title,
          slug,
          genre,
          releaseDate: new Date(releaseDate),
          description,
          categoryId: Number(categoryId),
          ...(banner && { banner }),
          ...(trailer && { trailer }),
          ...(movie && { movie })
        },
      });
      res.json(updatedMovie);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Delete movie (admin only)
  delete: async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(400).json({ error: 'Invalid movie ID.' });
    try {
      const exists = await prisma.movie.findUnique({ where: { id: Number(id) } });
      if (!exists) return res.status(404).json({ error: 'Movie not found.' });
      await prisma.movie.delete({ where: { id: Number(id) } });
      res.json({ message: 'Movie deleted.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default movieController;
