import express from 'express';
import { authenticateToken } from './auth.js';
import { postReviews, updateReviews, deleteReviews } from '../database.js';

const router = express.Router();

router.post('/books/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const { id: book_id } = req.params;
        const { review, rating } = req.body;
        const user_id = req.user.userId;
        const result = await postReviews(book_id, review, rating, user_id);
        res.status(201).json({ message: 'Review added', reviewId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add review' });
    }
});

router.put('/reviews/:id', authenticateToken, async (req, res) => {
    try {
        const result = await updateReviews(req.params.id, req.body, req.user.userId);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found or unauthorized' });
        res.status(200).json({ message: 'Review updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update review' });
    }
});

router.delete('/reviews/:id', authenticateToken, async (req, res) => {
    try {
        const result = await deleteReviews(req.params.id, req.user.userId);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found or unauthorized' });
        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

export default router;
