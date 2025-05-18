import Activity from '../models/Activity.js';

const logActivity = (actionType) => async (req, res, next) => {
  try {
    const baseActivity = {
      user: req.user.id,
      board: req.board?.id || req.body.boardId,
    };

    const activities = {
      TASK_CREATE: {
        type: 'CREATE',
        description: `Created task '${req.body.title}'`,
        task: res.locals.task?._id,
        list: req.body.listId
      },
      TASK_MOVE: {
        type: 'MOVE',
        description: `Moved task to position ${req.body.position}`,
        task: req.params.id,
        list: req.body.listId
      },
      TASK_UPDATE: {
        type: 'UPDATE',
        description: `Updated task details`,
        task: req.params.id
      },
      LIST_CREATE: {
        type: 'CREATE',
        description: `Created list '${req.body.title}'`,
        list: res.locals.list?._id
      }
    };

    if (activities[actionType]) {
      await Activity.create({ ...baseActivity, ...activities[actionType] });
    }
    
    next();
  } catch (error) {
    console.error('Activity logging failed:', error);
    next();
  }
};

export default logActivity;