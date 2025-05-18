import mongoose from 'mongoose';

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a list title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  position: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

listSchema.pre('remove', async function(next) {
  await this.model('Task').deleteMany({ list: this._id });
  next();
});

export default mongoose.model('List', listSchema);