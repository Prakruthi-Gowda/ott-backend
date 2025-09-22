import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors'; // <-- import cors
import movieRoutes from './routes/movieRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// CORS setup
app.use(cors({
  origin: 'http://localhost:5173', // replace with your frontend URL
  credentials: true, // if you use cookies/auth headers
}));

// Routes
app.use('/api/admin/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/categories', categoryRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
