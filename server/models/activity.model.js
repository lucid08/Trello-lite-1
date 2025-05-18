import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'MOVE', 'DELETE'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Activity', activitySchema);