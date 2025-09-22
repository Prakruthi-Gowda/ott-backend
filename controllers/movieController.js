import fs from 'fs';

import { PrismaClient } from '@prisma/client';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { slugify } from '../utils/slugify.js';
import { checkDuplicateMovie } from '../utils/checkDuplicateMovie.js';
import { saveFileToUploads } from '../utils/saveFileToUploads.js';

const prisma = new PrismaClient();

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

    const slug = slugify(title);

    try {
      // Use global function to check for duplicate before saving files
      const isDuplicate = await checkDuplicateMovie(title);
      if (isDuplicate) {
        return res.status(409).json({ success: false, error: 'Movie title and slug must be unique.' });
      }

      // Save files to uploads folder using global function
      const bannerFile = req.files?.banner?.[0];
      const trailerFile = req.files?.trailer?.[0];
      const movieFile = req.files?.movie?.[0];

      if (!bannerFile || !trailerFile || !movieFile) {
        return res.status(400).json({ error: 'Banner, trailer, and movie files are required.' });
      }

  const banner = saveFileToUploads(bannerFile.buffer, bannerFile.originalname);
  const trailer = saveFileToUploads(trailerFile.buffer, trailerFile.originalname);
  const movie = saveFileToUploads(movieFile.buffer, movieFile.originalname);

      const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found.' });
      }

      const newMovie = await prisma.movie.create({
        data: { title, slug, genre, releaseDate: new Date(releaseDate), description, banner, trailer, movie, categoryId: Number(categoryId) },
      });

      res.status(201).json({ success: true, data: newMovie });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
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
  // Handle file uploads using saveFileToUploads for new files
  const bannerFile = req.files?.banner?.[0];
  const trailerFile = req.files?.trailer?.[0];
  const movieFile = req.files?.movie?.[0];
  const banner = bannerFile ? saveFileToUploads(bannerFile.buffer, bannerFile.originalname) : undefined;
  const trailer = trailerFile ? saveFileToUploads(trailerFile.buffer, trailerFile.originalname) : undefined;
  const movie = movieFile ? saveFileToUploads(movieFile.buffer, movieFile.originalname) : undefined;
    const slug = slugify(title);
    
    try {
      const exists = await prisma.movie.findUnique({ where: { id: Number(id) } });

      if (!exists){
        return res.status(404).json({ error: 'Movie not found.' });
      } 

      const titleOrSlugExists = await prisma.movie.findFirst({ where: { OR: [{ title }, { slug }], NOT: { id: Number(id) } } });

      if (titleOrSlugExists){
        return res.status(409).json({ status: false, error: 'Movie title and slug must be unique.' });
      } 

      const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
      
      if (!category){
        return res.status(404).json({ status: false, error: 'Category not found.' });
      } 

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

      res.json({ status: true, data: updatedMovie });

    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  },
  // Delete movie (admin only)
  delete: async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))){
      return res.status(400).json({ status: false, error: 'Invalid movie ID.' });
    } 

    try {
      const exists = await prisma.movie.findUnique({ where: { id: Number(id) } });

      if (!exists){
        return res.status(404).json({ status: false, error: 'Movie not found.' });
      }

      // Delete associated files if they exist
      const fileFields = ['banner', 'trailer', 'movie'];
      for (const field of fileFields) {
        if (exists[field] && typeof exists[field] === 'string') {
          try {
            if (fs.existsSync(exists[field])) {
              fs.unlinkSync(exists[field]);
            } else if (fs.existsSync(`${process.cwd()}/${exists[field]}`)) {
              fs.unlinkSync(`${process.cwd()}/${exists[field]}`);
            }
          } catch (err) {
            // Optionally log error
          }
        }
      }

      await prisma.movie.delete({ where: { id: Number(id) } });
      res.json({ status: true, message: 'Movie deleted.' });

    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};

export default movieController;
