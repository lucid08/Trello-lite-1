import express from 'express';
import Activity from '../models/activity.model.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/boards/:boardId', protect, async (req, res) => {
  try {
    
    const activities = await Activity.find({ board: req.params.boardId })
      .sort('-createdAt')
      .populate('user', 'name email')
      .populate('task', 'title')
      .populate('list', 'title')
      .limit(50);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;