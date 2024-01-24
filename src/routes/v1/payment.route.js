const express = require('express');
// const { validate } = require('../../models/project.model');
// const authValidation = require('../../validations/auth.validation');
const { projectController, paymentController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();
router.route('/').post(auth('getUsers'), paymentController.createPayment).get(auth('client'), paymentController.getPayments);
router
  .route('/:projectId')
  .patch(auth('getUsers'), paymentController.updatePayment)
  .delete(auth('getUser'), projectController.deleteProject);
router.route('/update-status/:paymentId').patch(paymentController.updatePaymentStatus);

module.exports = router;
