const express = require('express');
const router = express.Router();
const {
  analyzeHarmfulEffects,
  getProjectHarmfulEffectScenarios,
  getHarmfulEffectScenario,
  deleteHarmfulEffectScenario
} = require('../controllers/harmfulEffectsController');

/**
 * @route POST /api/harmful-effects/:ProjectIdentifier/:StageName
 * @desc Run threshold check + Gemini analysis for that stage and save scenario
 * @access Public
 */
router.post('/:ProjectIdentifier/:StageName', analyzeHarmfulEffects);

/**
 * @route GET /api/harmful-effects/:ProjectIdentifier
 * @desc List all harmful effect scenarios for the project
 * @access Public
 */
router.get('/:ProjectIdentifier', getProjectHarmfulEffectScenarios);

/**
 * @route GET /api/harmful-effects/:ProjectIdentifier/:ScenarioId
 * @desc Fetch one saved scenario
 * @access Public
 */
router.get('/:ProjectIdentifier/:ScenarioId', getHarmfulEffectScenario);

/**
 * @route DELETE /api/harmful-effects/:ProjectIdentifier/:ScenarioId
 * @desc Delete a harmful effect scenario
 * @access Public
 */
router.delete('/:ProjectIdentifier/:ScenarioId', deleteHarmfulEffectScenario);

module.exports = router;