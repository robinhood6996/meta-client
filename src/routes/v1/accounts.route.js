const express = require('express');
// const { validate } = require('../../models/project.model');
// const authValidation = require('../../validations/auth.validation');
const { accountController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();
router.route('/').post(auth('getUsers'), accountController.createAccount).get(auth('client'), accountController.getAccounts);

module.exports = router;
