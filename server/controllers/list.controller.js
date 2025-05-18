import List from '../models/list.model.js';
import Board from '../models/board.model.js';
import Activity from '../models/activity.model.js';

const createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    if (!title || !boardId) {
      res.status(400);
      throw new Error('Please provide title and board ID');
    }

    const board = await Board.findOne({
      _id: boardId,
      user: req.user.id
    });

    if (!board) throw new Error('Board not found');

    const lastList = await List.findOne({ board: boardId })
      .sort('-position')
      .select('position');
    
    const newPosition = lastList ? lastList.position + 1 : 0;

    const list = await List.create({
      title,
      board: boardId,
      position: newPosition
    });

    await Board.findByIdAndUpdate(boardId, { $push: { lists: list._id } });

    await Activity.create({
      user: req.user.id,
      board: boardId,
      list: list._id,
      type: 'CREATE',
      description: `Created list "${list.title}" in board "${board.title}"`
    });

    res.status(201).json(list);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const updateList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id).populate('board');
    if (!list) throw new Error('List not found');
    if (list.board.user.toString() !== req.user.id) throw new Error('Unauthorized');

    const oldTitle = list.title;
    const oldPosition = list.position;

    const updatedList = await List.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title || list.title,
        position: req.body.position ?? list.position
      },
      { new: true, runValidators: true }
    ).populate('tasks');

    if (updatedList.title !== oldTitle) {
      await Activity.create({
        user: req.user.id,
        board: list.board._id,
        list: list._id,
        type: 'UPDATE',
        description: `Renamed list from "${oldTitle}" to "${updatedList.title}" in board "${list.board.title}"`
      });
    }

    if (updatedList.position !== oldPosition) {
      await Activity.create({
        user: req.user.id,
        board: list.board._id,
        list: list._id,
        type: 'MOVE',
        description: `Moved list "${updatedList.title}" from position ${oldPosition} to ${updatedList.position} in board "${list.board.title}"`
      });
    }

    res.status(200).json(updatedList);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id).populate('board');
    if (!list) throw new Error('List not found');
    if (list.board.user.toString() !== req.user.id) throw new Error('Unauthorized');

    await Activity.create({
      user: req.user.id,
      board: list.board._id,
      list: list._id,
      type: 'DELETE',
      description: `Deleted list "${list.title}" from board "${list.board.title}"`
    });

    await Board.findByIdAndUpdate(list.board._id, { $pull: { lists: list._id } } );
    await List.deleteOne({ _id: list._id });
    
    res.status(200).json({ message: 'List removed' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export { createList, updateList, deleteList };