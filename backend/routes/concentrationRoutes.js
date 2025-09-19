const express = require('express');
const router = express.Router();
const { handlePostConcentrationStage, handleGetConcentrationStage } = require('../controllers/concentrationController');
const { concentrationValidationRules } = require('../utils/validationRules');

router.post('/:ProjectIdentifier', concentrationValidationRules(), handlePostConcentrationStage);
router.get('/:ProjectIdentifier', handleGetConcentrationStage);

module.exports = router;