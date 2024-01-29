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

// M7q0_tyGPQvaG3MZLLc_C5br4as - Cloudinary API Secret
// 882374222524436 -Cloudinary API Key
// meta-client - Bucket name;
// dh9up6qrj - Cloud name;

const Project = mongoose.model('Payment', paymentSchema);

module.exports = Project;
