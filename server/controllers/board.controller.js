import Board from '../models/board.model.js';
import List from '../models/list.model.js';
import Activity from '../models/activity.model.js';

const createBoard = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Please provide a board title');
    }

    const board = await Board.create({
      title,
      user: req.user.id
    });
    await Activity.create({
      user: req.user.id,
      board: board._id,
      type: 'CREATE',
      description: `Created board "${board.title}"`
    });

    res.status(201).json({
      _id: board._id,
      title: board.title,
      user: board.user,
      createdAt: board.createdAt
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ user: req.user.id })
      .populate({
        path: 'lists',
        populate: {
          path: 'tasks',
          model: 'Task'
        }
      })
      .sort('-createdAt');

    res.status(200).json(boards);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate({
      path: 'lists',
      populate: {
        path: 'tasks',
        model: 'Task'
      }
    });

    if (!board) {
      res.status(404);
      throw new Error('Board not found');
    }

    res.status(200).json(board);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

const updateBoard = async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!board) throw new Error('Board not found');

    const oldTitle = board.title;
    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title || board.title,
        lists: req.body.lists || board.lists
      },
      { new: true, runValidators: true }
    ).populate('lists');

    if (req.body.title && req.body.title !== oldTitle) {
      await Activity.create({
        user: req.user.id,
        board: board._id,
        type: 'UPDATE',
        description: `Renamed board from "${oldTitle}" to "${updatedBoard.title}"`
      });
    }

    res.status(200).json(updatedBoard);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}


const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!board) throw new Error('Board not found');

    await Activity.create({
      user: req.user.id,
      board: board._id,
      type: 'DELETE',
      description: `Deleted board "${board.title}"`
    });

    await Board.deleteOne({ _id: board._id });
    res.status(200).json({ message: 'Board removed' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

export {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard
};