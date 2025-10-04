import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import movieRoutes from './routes/movieRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js'; // ✅ import userRoutes

dotenv.config();
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// CORS setup
// app.use(cors({
//   origin: 'http://localhost:5173', 
//   credentials: true,
// }));

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or curl)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // allow cookies/auth headers
}));

// Static uploads folder
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/admin/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/users', userRoutes); // ✅ users route

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
