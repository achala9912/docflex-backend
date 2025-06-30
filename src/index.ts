import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import itemRoutes from './routes/item.routes';
import authRoutes from './routes/auth.route';
import roleRoutes from './routes/role.route';
import userRoutes from './routes/user.route';
import errorHandler from './utils/errorHandler';

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);

// Error handler (should come after all routes)
app.use(errorHandler);

// Start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
