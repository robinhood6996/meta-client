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

const paymentSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    paymentMedia: {
      type: String,
      enum: ['bkash', 'nagad', 'bank', 'cash', 'other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentRef: {
      type: String,
      required: true,
    },
    paymentProve: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'canceled'],
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

const Project = mongoose.model('Payment', paymentSchema);

module.exports = Project;
