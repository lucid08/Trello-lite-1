import express from 'express';
import {
  createTask,
  updateTask,
  updateTaskPosition,
  deleteTask
} from '../controllers/task.controller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.put('/:id/position', protect, updateTaskPosition);
router.delete('/:id', protect, deleteTask);

export default router;