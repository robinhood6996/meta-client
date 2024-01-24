const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Payment, Account } = require('../models');
const logger = require('../config/logger');

const createPayment = catchAsync(async (req, res) => {
  const user = { ...req.user };
  const { title, paymentMedia, paymentRef, amount } = req.body;
  if (!user) {
    res.status(httpStatus.CREATED).send('error');
  }
  const payment = {
    title,
    paymentMedia,
    paymentRef,
    amount,
    status: 'pending',
    user: {
      id: user._doc._id,
      name: user._doc.name,
      email: user._doc.email,
    },
  };
  const createdProject = await Payment.create(payment);
  res.status(httpStatus.CREATED).send(createdProject);
});

// Get projects
const getPayments = catchAsync(async (req, res) => {
  const userRole = req.user._doc.role; // Assuming user role is available in the request object
  const userEmail = req.user._doc.email; // Assuming user email is available in the request object

  try {
    let { limit, offset } = req.query;
    const { search, startDate, endDate, currentMonth, email, status } = req.query;
    limit = parseInt(limit, 10) || 20; // Default limit to 20 if not provided
    offset = parseInt(offset, 10) || 0; // Default offset to 0 if not provided

    let query = {};

    if (userRole === 'admin') {
      // Admin can see all projects
      if (email) {
        query = { 'user.email': email };
      }
    } else if (userRole === 'client') {
      // Clients can only see their own projects
      query = { 'user.email': userEmail };
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search on projectName
      ];
    }
    // Add date range filter
    // Add date range filter to createdAt and updatedAt
    if (startDate && endDate) {
      query.$or = [
        { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      ];
    } else if (currentMonth) {
      // Get the start and end dates for the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      query.$or = [
        { createdAt: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() } },
        { updatedAt: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const projects = await Payment.find(query).limit(limit).skip(offset);
    res.status(httpStatus.OK).json(projects);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

// Update payment status by Admin.
const updatePaymentStatus = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;
  const payment = await Payment.findByIdAndUpdate(paymentId, status);
  const userEmail = payment.user.email;
  const userAccount = await Account.findOne({ 'user.email': `${userEmail}` });
  if (status === 'verified') {
    userAccount.paid += payment.amount;
    await userAccount.save();
  }

  res.status(httpStatus.OK).send(payment);
});

// Update payment if mistakenly any wrong inpu
const updatePayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const newData = { ...req.body };
  const updatedProject = await Payment.findByIdAndUpdate(paymentId, newData, { new: true });
  if (!updatedProject) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Payment reference not found' });
  }
  res.status(httpStatus.OK).send(updatedProject);
});

// Delete projects
const deletePayment = catchAsync(async (req, res) => {
  const userRole = req.user._doc.role; // Assuming user role is available in the request object
  // const userEmail = req.user._doc.email; // Assuming user email is available in the request object
  const { paymentId } = req.params;
  try {
    let payment;

    if (userRole === 'admin') {
      payment = await Payment.findById(paymentId);
    } else if (userRole === 'client') {
      payment = await userRole.findById(paymentId);
      if (payment.status !== 'pending') {
        return res.status(httpStatus['403_MESSAGE']).json({ message: 'Payment reference not found' });
      }
    }
    if (payment) {
      await Payment.findByIdAndDelete(paymentId);
      res.json({ message: 'DELETED' });
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Payment reference not found' });
    }
    // res.json(project);
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  createPayment,
  getPayments,
  updatePaymentStatus,
  updatePayment,
  deletePayment,
};
