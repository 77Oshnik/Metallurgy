const express = require('express');
const router = express.Router();
const { handlePostEndOfLifeStage, handleGetEndOfLifeStage } = require('../controllers/endOfLifeController');
const { endOfLifeValidationRules } = require('../utils/validationRules');

router.post('/:ProjectIdentifier', endOfLifeValidationRules(), handlePostEndOfLifeStage);
router.get('/:ProjectIdentifier', handleGetEndOfLifeStage);

module.exports = router;