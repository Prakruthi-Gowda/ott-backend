import { PrismaClient } from '@prisma/client';

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

const categoryController = {
  // Create category (admin only)
  create: async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can create categories.' });
    }

    const name = req.body?.name;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Category name is required and must be a non-empty string.' });
    }

    const slug = slugify(name);
    try {
      const exists = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
      if (exists) return res.status(409).json({ success: false, error: 'Category name and slug must be unique.' });

      const category = await prisma.category.create({ data: { name, slug } });
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all categories (any logged-in user)
  getAll: async (req, res) => {
    try {
      const categories = await prisma.category.findMany();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get category by ID (any logged-in user)
  getById: async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(400).json({ error: 'Invalid category ID.' });

    try {
      const category = await prisma.category.findUnique({ where: { id: Number(id) } });
      if (!category) return res.status(404).json({ error: 'Category not found.' });
      res.json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update category (admin only)
  update: async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can update categories.' });
    }

    const { id } = req.params;
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required and must be a non-empty string.' });
    }

    const slug = slugify(name);
    try {
      const exists = await prisma.category.findUnique({ where: { id: Number(id) } });
      if (!exists) return res.status(404).json({ error: 'Category not found.' });

      const nameOrSlugExists = await prisma.category.findFirst({
        where: { OR: [{ name }, { slug }], NOT: { id: Number(id) } }
      });

      if (nameOrSlugExists) return res.status(409).json({ error: 'Category name and slug must be unique.' });

      const category = await prisma.category.update({ where: { id: Number(id) }, data: { name, slug } });
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete category (admin only)
  delete: async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can delete categories.' });
    }

    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(400).json({ error: 'Invalid category ID.' });

    try {
      const exists = await prisma.category.findUnique({ where: { id: Number(id) } });
      if (!exists) return res.status(404).json({ error: 'Category not found.' });

      await prisma.category.delete({ where: { id: Number(id) } });
      res.json({ success: true, message: 'Category deleted.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default categoryController;
