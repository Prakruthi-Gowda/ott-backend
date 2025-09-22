import prisma from '../prismaClient.js';
import { slugify } from './slugify.js';

export async function checkDuplicateMovie(title) {
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Title is required and must be a non-empty string.');
  }
  const slug = slugify(title);
  const exists = await prisma.movie.findFirst({ where: { OR: [{ title }, { slug }] } });
  return !!exists;
}