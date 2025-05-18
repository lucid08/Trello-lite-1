import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a board title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

boardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

boardSchema.pre('remove', async function(next) {
  await this.model('List').deleteMany({ board: this._id });
  next();
});

export default mongoose.model('Board', boardSchema);