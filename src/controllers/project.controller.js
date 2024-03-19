const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Project, Account } = require('../models');
const logger = require('../config/logger');

const createProject = catchAsync(async (req, res) => {
  const user = { ...req.user };
  if (!user) {
    res.status(httpStatus.CREATED).send('error');
  }

  const project = {
    ...req.body,
    status: 'pending',
    user: {
      id: user._doc._id,
      name: user._doc.name,
      email: user._doc.email,
    },
  };
  const createdProject = await Project.create(project);
  res.status(httpStatus.CREATED).send(createdProject);
});

const updateProject = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const newData = { ...req.body };
  const updatedProject = await Project.findByIdAndUpdate(projectId, newData, { new: true });
  if (!updatedProject) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Project not found' });
  }
  if (newData.spentAmount) {
    const userEmail = updatedProject.user.email;
    const userAccount = await Account.findOne({ 'user.email': `${userEmail}` });
    userAccount.spentAmount += newData.spentAmount;
    await userAccount.save();
  }
  res.status(httpStatus.OK).send(updatedProject);
});

// Create project status only its for Client only
const updateProjectStatus = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;
  const updatedProject = await Project.findByIdAndUpdate(projectId, status);
  const userEmail = updatedProject.user.email;
  const userAccount = await Account.findOne({ 'user.email': `${userEmail}` });
  if (status === 'complete') {
    userAccount.spentAmount += updatedProject.budget;
    await userAccount.save();
  }
  if (status === 'reject' || status === 'pause') {
    if (updatedProject.spentAmount) {
      userAccount.spentAmount += updatedProject.spentAmount;
    }
    await userAccount.save();
  }
  res.status(httpStatus.OK).send(updatedProject);
});

// Get projects
const getProjects = catchAsync(async (req, res) => {
  const userRole = req.user._doc.role; // Assuming user role is available in the request object
  const userEmail = req.user._doc.email; // Assuming user email is available in the request object

  try {
    let { limit, offset } = req.query;
    const { search, startDate, endDate, currentMonth, status } = req.query;
    limit = parseInt(limit, 10) || 20; // Default limit to 20 if not provided
    offset = parseInt(offset, 10) || 0; // Default offset to 0 if not provided

    let query = {};

    if (userRole === 'admin') {
      // Admin can see all projects
    } else if (userRole === 'client') {
      // Clients can only see their own projects
      query = { 'user.email': userEmail };
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search on projectName
        { link: { $regex: search, $options: 'i' } }, // Case-insensitive search on projectDescription
      ];
    }
    if (status) {
      query.status = status;
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
    // Get the total count of matching documents
    const totalCount = await Project.countDocuments(query);
    const projects = await Project.find(query).sort({ createdAt: -1 }).limit(limit).skip(offset);
    res.status(httpStatus.OK).json({ meta: { totalCount, resultCount: projects.length }, projects });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

// Get projects
const getProjectsStats = catchAsync(async (req, res) => {
  const userRole = req.user._doc.role; // Assuming user role is available in the request object
  const userEmail = req.user._doc.email; // Assuming user email is available in the request object
  let query = {};
  if (userRole === 'admin') {
    // Admin can see all projects
  } else if (userRole === 'client') {
    // Clients can only see their own projects
    query = { 'user.email': userEmail };
  }
  // Get the start and end dates for the current month for project
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  query.$or = [
    { createdAt: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() } },
    { updatedAt: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() } },
  ];
  const active = await Project.countDocuments({ ...query, status: 'active' });
  const pending = await Project.countDocuments({ ...query, status: 'pending' });
  const pause = await Project.countDocuments({ ...query, status: 'pause' });
  const complete = await Project.countDocuments({ ...query, status: 'complete' });
  const reject = await Project.countDocuments({ ...query, status: 'reject' });
  const notDelivered = await Project.countDocuments({ ...query, status: 'not-delivered' });
  // End for project

  res.status(httpStatus.OK).json({ projects: { active, pending, reject, notDelivered, pause, complete } });
});
// Delete projects
const deleteProject = catchAsync(async (req, res) => {
  const userRole = req.user._doc.role; // Assuming user role is available in the request object
  // const userEmail = req.user._doc.email; // Assuming user email is available in the request object
  const { projectId } = req.params;
  try {
    let project;

    if (userRole === 'admin') {
      project = await Project.findById(projectId);
    } else if (userRole === 'client') {
      project = await Project.findById(projectId);
    }
    if (project) {
      await Project.findByIdAndDelete(projectId);
      res.json({ message: 'DELETED' });
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Project not found' });
    }
    // res.json(project);
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  createProject,
  updateProject,
  updateProjectStatus,
  getProjects,
  deleteProject,
  getProjectsStats,
};
