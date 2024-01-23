const express = require('express');
// const { validate } = require('../../models/project.model');
// const authValidation = require('../../validations/auth.validation');
const { projectController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();
router.route('/').post(auth('getUsers'), projectController.createProject).get(auth('client'), projectController.getProjects);
router
  .route('/:projectId')
  .patch(auth('getUsers'), projectController.updateProject)
  .delete(auth('getUser'), projectController.deleteProject);
router.route('/update-status/:projectId').patch(projectController.updateProjectStatus);

module.exports = router;
