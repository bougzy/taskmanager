const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
    },
    description: {
      type: String,
    },
    deadline: {
      type: Date,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    tags: {
      type: [String], 
      default: [],
    },
    sharedWith: {
      type: [String], 
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
