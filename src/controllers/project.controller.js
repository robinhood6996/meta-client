const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Project } = require('../models');
const logger = require('../config/logger');

const createProject = catchAsync(async (req, res) => {
  const user = { ...req.user };
  if (!user) {
    res.status(httpStatus.CREATED).send('error');
  }
  const project = {
    ...req.body,
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
  res.status(httpStatus.OK).send(updatedProject);
});

// Create project status only its for Client only
const updateProjectStatus = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;
  const updatedProject = await Project.findByIdAndUpdate(projectId, status);

  res.status(httpStatus.OK).send(updatedProject);
});

// Get projects
const getProjects = catchAsync(async (req, res) => {
  const userRole = req.user._doc.role; // Assuming user role is available in the request object
  const userEmail = req.user._doc.email; // Assuming user email is available in the request object

  try {
    let projects;

    if (userRole === 'admin') {
      projects = await Project.find();
    } else if (userRole === 'client') {
      projects = await Project.find({ 'user.email': userEmail });
    }
    res.json(projects);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
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
};
