import express from 'express';
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard
} from '../controllers/board.controller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBoard)
  .get(protect, getBoards);

router.route('/:id')
  .get(protect, getBoard)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

export default router;