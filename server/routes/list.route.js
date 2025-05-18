import express from 'express';
import {
  createList,
  updateList,
  deleteList
} from '../controllers/list.controller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createList);

router.route('/:id')
  .put(protect, updateList)
  .delete(protect, deleteList);

export default router;