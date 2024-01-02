const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Account, User } = require('../models');

const createAccount = catchAsync(async (req, res) => {
  const user = { ...req.user };
  const userRole = req.user._doc.role;
  if (userRole !== 'admin') {
    res.status(403).json({ message: 'You are not allowed to create account' });
  }
  if (!user) {
    res.status(httpStatus.CREATED).send('error');
  }
  const { email } = req.body;
  if (email) {
    const userData = await User.findOne({ email });
    const createAccountData = {
      user: {
        id: userData._id,
        name: userData.name,
        email: userData.email,
      },
    };
    const createdProject = await Account.create(createAccountData);
    res.status(httpStatus.CREATED).send(createdProject);
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'User email is required' });
  }
});

const getAccounts = catchAsync(async (req, res) => {
  const user = { ...req.user };
  const userRole = req.user._doc.role; // Assuming user role is available in the request object
  const userEmail = req.user._doc.email; // Assuming user email is available in the request object
  if (!user) {
    res.status(httpStatus.CREATED).send('error');
  }

  try {
    let accounts;

    if (userRole === 'admin') {
      accounts = await Account.find();
    } else if (userRole === 'client') {
      accounts = await Account.find({ 'user.email': userEmail });
    }
    res.json(accounts);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  createAccount,
  getAccounts,
};
