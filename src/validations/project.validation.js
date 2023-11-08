const Joi = require('joi');

const validateProject = {
  body: Joi.object().keys({
    spentAmount: Joi.number().integer(),
  }),
};

module.exports = {
  validateProject,
};
