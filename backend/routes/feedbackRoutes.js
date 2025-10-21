// backend/routes/feedbackRoutes.js
import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// POST → create new feedback
router.post('/', async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving feedback' });
  }
});

// GET → fetch all feedback
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedbacks' });
  }
});

export default router;
