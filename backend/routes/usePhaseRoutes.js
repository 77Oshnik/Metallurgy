const express = require('express');
const router = express.Router();
const { handlePostUsePhaseStage, handleGetUsePhaseStage } = require('../controllers/usePhaseController');
const { usePhaseValidationRules } = require('../utils/validationRules');

router.post('/:ProjectIdentifier', usePhaseValidationRules(), handlePostUsePhaseStage);
router.get('/:ProjectIdentifier', handleGetUsePhaseStage);

module.exports = router;