const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const valorizationController = require('../controllers/valorizationController');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Validation rules for project identifier
const validateProjectId = [
  param('ProjectIdentifier')
    .isMongoId()
    .withMessage('Invalid Project Identifier format')
];

// Validation rules for scenario identifier
const validateScenarioId = [
  param('ScenarioId')
    .isMongoId()
    .withMessage('Invalid Scenario Identifier format')
];

// Validation rules for byproduct analysis request
const validateAnalysisRequest = [
  body('byproductNames')
    .optional()
    .isArray()
    .withMessage('byproductNames must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        for (const name of value) {
          if (typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Each byproduct name must be a non-empty string');
          }
        }
      }
      return true;
    }),
  body('constraints')
    .optional()
    .isObject()
    .withMessage('constraints must be an object'),
  body('constraints.preferLowCapex')
    .optional()
    .isBoolean()
    .withMessage('preferLowCapex must be a boolean'),
  body('constraints.quickPayback')
    .optional()
    .isBoolean()
    .withMessage('quickPayback must be a boolean'),
  body('constraints.region')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('region must be a string between 2 and 100 characters'),
  body('constraints.exportRestrictions')
    .optional()
    .isBoolean()
    .withMessage('exportRestrictions must be a boolean'),
  body('constraints.localMarketPreferences')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('localMarketPreferences must be a string up to 200 characters')
];

// Validation rules for scenario update
const validateScenarioUpdate = [
  body('constraints')
    .isObject()
    .withMessage('constraints object is required for update'),
  body('constraints.preferLowCapex')
    .optional()
    .isBoolean()
    .withMessage('preferLowCapex must be a boolean'),
  body('constraints.quickPayback')
    .optional()
    .isBoolean()
    .withMessage('quickPayback must be a boolean'),
  body('constraints.region')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('region must be a string between 2 and 100 characters'),
  body('constraints.exportRestrictions')
    .optional()
    .isBoolean()
    .withMessage('exportRestrictions must be a boolean'),
  body('constraints.localMarketPreferences')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('localMarketPreferences must be a string up to 200 characters')
];

/**
 * @route POST /api/valorization/:ProjectIdentifier/analyze
 * @desc Analyze byproducts for valorization opportunities
 * @access Public
 * @body {string[]} byproductNames - Optional array of specific byproduct names to analyze
 * @body {object} constraints - Optional constraints for the analysis
 */
router.post(
  '/:ProjectIdentifier/analyze',
  validateProjectId,
  validateAnalysisRequest,
  handleValidationErrors,
  valorizationController.analyzeByproductValorization
);

/**
 * @route GET /api/valorization/:ProjectIdentifier
 * @desc Get all valorization scenarios for a project
 * @access Public
 */
router.get(
  '/:ProjectIdentifier',
  validateProjectId,
  handleValidationErrors,
  valorizationController.getProjectValorizationScenarios
);

/**
 * @route GET /api/valorization/:ProjectIdentifier/available-byproducts
 * @desc Get available byproducts for a project (without analysis)
 * @access Public
 */
router.get(
  '/:ProjectIdentifier/available-byproducts',
  validateProjectId,
  handleValidationErrors,
  valorizationController.getAvailableByproducts
);

/**
 * @route GET /api/valorization/:ProjectIdentifier/:ScenarioId
 * @desc Get detailed valorization scenario
 * @access Public
 */
router.get(
  '/:ProjectIdentifier/:ScenarioId',
  validateProjectId,
  validateScenarioId,
  handleValidationErrors,
  valorizationController.getValorizationScenarioDetail
);

/**
 * @route PUT /api/valorization/:ProjectIdentifier/:ScenarioId
 * @desc Update valorization scenario (re-analyze with new constraints)
 * @access Public
 * @body {object} constraints - New constraints for re-analysis
 */
router.put(
  '/:ProjectIdentifier/:ScenarioId',
  validateProjectId,
  validateScenarioId,
  validateScenarioUpdate,
  handleValidationErrors,
  valorizationController.updateValorizationScenario
);

/**
 * @route DELETE /api/valorization/:ProjectIdentifier/:ScenarioId
 * @desc Delete valorization scenario
 * @access Public
 */
router.delete(
  '/:ProjectIdentifier/:ScenarioId',
  validateProjectId,
  validateScenarioId,
  handleValidationErrors,
  valorizationController.deleteValorizationScenario
);

// Error handling middleware specific to valorization routes
router.use((error, req, res, next) => {
  console.error('Valorization route error:', error);
  
  // Handle specific error types
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid identifier format',
      details: error.message
    });
  }
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Data validation failed',
      details: error.message
    });
  }
  
  if (error.name === 'MongoError' && error.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate valorization scenario',
      details: 'A scenario for this byproduct already exists'
    });
  }
  
  // Handle Gemini API errors
  if (error.message && error.message.includes('Gemini')) {
    return res.status(503).json({
      error: 'AI service unavailable',
      details: 'The valorization analysis service is temporarily unavailable'
    });
  }
  
  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
  });
});

module.exports = router;