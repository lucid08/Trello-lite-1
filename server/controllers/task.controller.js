import Task from '../models/task.model.js';
import List from '../models/list.model.js';
import Activity from '../models/activity.model.js';


const verifyListOwnership = async (listId, userId) => {
  const list = await List.findById(listId).populate('board');
  if (!list || list.board.user.toString() !== userId) {
    throw new Error('List not found or unauthorized');
  }
  return list;
};

const createTask = async (req, res) => {
  try {
    const { title, listId } = req.body;

    if (!title || !listId) {
      res.status(400);
      throw new Error('Please provide title and list ID');
    }

    const list = await verifyListOwnership(listId, req.user.id);

    const lastTask = await Task.findOne({ list: listId })
      .sort('-position')
      .select('position');
    
    const newPosition = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title,
      list: listId,
      position: newPosition,
      description: req.body.description,
      assignedTo: req.body.assignedTo,
      dueDate: req.body.dueDate
    });
    await List.findByIdAndUpdate(listId, { $push: { tasks: task._id } });

    await Activity.create({
      user: req.user.id,
      board: list.board._id,
      task: task._id,
      list: listId,
      type: 'CREATE',
      description: `Created task "${task.title}" in list "${list.title}"`
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

const updateTask = async (req, res) => {
  try {
    console.log("SUmitt")
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'list',
        populate: { path: 'board', model: 'Board' }
      });

    if (!task) throw new Error('Task not found');
    if (task.list.board.user.toString() !== req.user.id) throw new Error('Unauthorized');

    const oldTitle = task.title;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const changes = [];
    if (req.body.title && req.body.title !== oldTitle) changes.push('title');
    if (req.body.description !== undefined) changes.push('description');
    if (req.body.assignedTo !== undefined) changes.push('assignment');
    if (req.body.dueDate !== undefined) changes.push('due date');

    if (changes.length > 0) {
      await Activity.create({
        user: req.user.id,
        board: task.list.board._id,
        task: task._id,
        list: task.list._id,
        type: 'UPDATE',
        description: `Updated ${changes.join(', ')} of task "${updatedTask.title}"`
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

const updateTaskPosition = async (req, res) => {
  try {
    const { listId, position } = req.body;
    
    // Find task with populated list and board
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'list',
        select: 'title board',
        populate: { path: 'board', select: 'user' }
      });

    if (!task?.list?.board) throw new Error('Task or board not found');
    if (task.list.board.user.toString() !== req.user.id) throw new Error('Unauthorized');

    let newList = null;
    let oldList = task.list;
    
    if (listId && listId !== task.list.id) {
      newList = await List.findById(listId)
        .populate({
          path: 'board',
          select: 'user'
        })
        .select('title board');

      if (!newList?.board) throw new Error('New list not found');
      if (newList.board.user.toString() !== req.user.id) throw new Error('Unauthorized list access');
    }

    const targetListId = listId || task.list.id;
    const originalPosition = task.position;

    if (listId && listId !== task.list.id) {
      await List.findByIdAndUpdate(oldList._id, { $pull: { tasks: task._id } });
      await List.findByIdAndUpdate(targetListId, { $push: { tasks: task._id } });
    }

    task.list = targetListId;
    task.position = position;
    await task.save();

    let activityDescription;
    const actionBoard = newList?.board || oldList.board;

    if (newList) {
      activityDescription = `Moved task "${task.title}" from list "${oldList.title}" to "${newList.title}"`;
    } else {
      activityDescription = position > originalPosition 
        ? `Moved task "${task.title}" down to position ${position} in "${oldList.title}"`
        : `Moved task "${task.title}" up to position ${position} in "${oldList.title}"`;
    }

    await Activity.create({
      user: req.user.id,
      board: actionBoard._id,
      task: task._id,
      list: targetListId,
      type: 'MOVE',
      description: activityDescription
    });

    res.status(200).json(task);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'list',
        populate: { path: 'board', model: 'Board' }
      });

    if (!task) throw new Error('Task not found');
    if (task.list.board.user.toString() !== req.user.id) throw new Error('Unauthorized');

    await List.findByIdAndUpdate(task.list.id, { $pull: { tasks: task._id } });
    await Task.deleteOne({ _id: task._id });

    await Activity.create({
      user: req.user.id,
      board: task.list.board._id,
      task: task._id,
      list: task.list._id,
      type: 'DELETE',
      description: `Deleted task "${task.title}" from list "${task.list.title}"`
    });

    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

export {
  createTask,
  updateTask,
  updateTaskPosition,
  deleteTask
};