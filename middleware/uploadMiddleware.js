import multer from 'multer';

// Use memory storage so files are not saved automatically
const storage = multer.memoryStorage();
const upload = multer({ storage });

export { upload };