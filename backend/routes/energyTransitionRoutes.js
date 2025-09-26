const express = require('express');
const router = express.Router();
const energyTransitionController = require('../controllers/energyTransitionController');

/**
 * @route POST /api/energy-transition/:ProjectIdentifier/:StageName
 * @desc Create a new energy transition scenario
 * @access Public
 */
router.post('/:ProjectIdentifier/:StageName', energyTransitionController.createEnergyTransitionScenario);

/**
 * @route GET /api/energy-transition/:ProjectIdentifier
 * @desc Get all energy transition scenarios for a project
 * @access Public
 */
router.get('/:ProjectIdentifier', energyTransitionController.getEnergyTransitionScenarios);

/**
 * @route DELETE /api/energy-transition/:ProjectIdentifier/:ScenarioId
 * @desc Delete an energy transition scenario
 * @access Public
 */
router.delete('/:ProjectIdentifier/:ScenarioId', energyTransitionController.deleteEnergyTransitionScenario);

module.exports = router;