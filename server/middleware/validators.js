// server/middleware/validators.js
// Joi schemas for all API inputs

const Joi = require("joi");

const schemas = {
  createRoom: Joi.object({
    maxUsers: Joi.number().min(1).max(10).default(2),
    ttlMs: Joi.number()
      .min(60000)
      .max(86400000)
      .default(24 * 60 * 60 * 1000),
    metadata: Joi.object().default({}),
  }),

  joinRoom: Joi.object({
    deviceName: Joi.string().max(100).required(),
  }),

  webrtcSignal: Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
    type: Joi.string().valid("offer", "answer", "ice").required(),
    payload: Joi.object().required(),
  }),
};

// ✅ Validation helper
function validate(data, schema) {
  const { error, value } = schema.validate(data, { stripUnknown: true });
  if (error) {
    throw {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: error.details[0].message,
      details: error.details,
    };
  }
  return value;
}

module.exports = { schemas, validate };
