const express = require('express');
const router = express.Router();
const controller = require('../controllers/whatifController');

/**
 * POST /api/whatif/:ProjectIdentifier/:StageName
 * create new scenario
 */
router.post('/:ProjectIdentifier/:StageName', controller.createScenario);

/**
 * GET /api/whatif/:ProjectIdentifier
 * list scenarios for a project
 */
router.get('/:ProjectIdentifier', controller.listScenarios);

/**
 * GET /api/whatif/:ProjectIdentifier/:ScenarioId
 * get scenario detail
 */
router.get('/:ProjectIdentifier/:ScenarioId', controller.getScenario);

/**
 * DELETE /api/whatif/:ProjectIdentifier/:ScenarioId
 * delete scenario
 */
router.delete('/:ProjectIdentifier/:ScenarioId', controller.deleteScenario);

module.exports = router;
