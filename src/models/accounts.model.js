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

const accountSchema = mongoose.Schema(
  {
    paid: {
      type: Number,
      required: false,
      default: 0,
    },
    due: {
      type: Number,
      required: false,
      default: 0,
    },
    spentAmount: {
      type: Number,
      required: false,
      default: 0,
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

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
