/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const projectSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    spentAmount: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'pause', 'complete', 'reject'],
      required: true,
    },
    user: {
      type: userSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
