const express = require('express');
// const { validate } = require('../../models/project.model');
// const authValidation = require('../../validations/auth.validation');
const { projectController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();
router
  .route('/')
  .post(auth('getUsers'), projectController.createProject)
  .get(auth('client', 'getUsers'), projectController.getProjects);
router.route('/:projectId').patch(auth('getUsers'), projectController.updateProject);
router.route('/update-status/:projectId').patch(projectController.updateProject);

module.exports = router;
