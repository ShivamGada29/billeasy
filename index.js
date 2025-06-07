import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import reviewRoutes from './routes/reviews.js';

dotenv.config();
const app = express();
app.use(express.json());

// Mount routes
app.use('/', authRoutes);         // Signup/Login will be at /auth/signup and /auth/login
app.use('/', bookRoutes);        // Books routes at /books and /books/:id
app.use('/', reviewRoutes);           // Reviews at /books/:id/reviews and /reviews/:id

app.get('/', (req, res) => {
    res.send('📚 Book Review API is running');
});

app.listen(3000, () => console.log('Server running on port 3000'));
