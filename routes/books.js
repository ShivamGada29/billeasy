import express from 'express';
import { authenticateToken } from './auth.js';
import { getBooks, getBook, postBooks, searchBooks } from '../database.js';

const router = express.Router();

router.get('/books', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, author, genre } = req.query;
        const offset = (page - 1) * limit;

        const filters = {
            author: author || null,
            genre: genre || null,
            limit: parseInt(limit),
            offset: parseInt(offset),
        };
        const books = await getBooks(filters);
        res.json(books);
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

router.get('/books/:id', authenticateToken, async (req, res) => {
    try {
        const book = await getBook(req.params.id);
        if (!book || book.length === 0) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

router.post('/books', authenticateToken, async (req, res) => {
    try {
        const { name, author, genre } = req.body;
        const result = await postBooks(name, author, genre);
        res.status(201).json({ message: 'Book created successfully', bookId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create book' });
    }
});

router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { author, name } = req.query;

        const filters = {
            author: author || null,
            name: name || null,
        };
        const books = await searchBooks(filters);
        res.json(books);
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

export default router;
