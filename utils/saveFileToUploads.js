import fs from 'fs';
import path from 'path';

/**
 * Save a file buffer to the uploads folder with a unique name.
 * @param {Buffer} buffer - The file buffer
 * @param {string} originalname - The original file name
 * @returns {string} The relative saved file path (e.g. uploads/filename.jpg)
 */
export function saveFileToUploads(buffer, originalname) {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalname}`;
  const filePath = path.join(uploadsDir, uniqueName);
  fs.writeFileSync(filePath, buffer);
  // Return relative path using POSIX style for URLs
  return path.posix.join('uploads', uniqueName);
}
